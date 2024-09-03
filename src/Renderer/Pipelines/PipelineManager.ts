import { makeShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { bindGroups } from "../BindGroups";
import { gpu } from "../Gpu";
import type { GraphNodeInterface, PropertyInterface } from "../ShaderBuilder/Types";
import type { PipelineInterface, PipelineManagerInterface, StageBindings } from "../Types";
import LinePipeline from "./LinePipeline";
import Pipeline from "./Pipeline";
// import ReticlePipeline from "./ReticlePipeline";
import TrajectoryPipeline from "./TrajectoryPipeline";
import { bloom, outputFormat } from "../RenderSetings";
import DecalPipeline from "./DecalPipeline";
import type ShaderGraph from "../ShaderBuilder/ShaderGraph";
import type { DrawableType } from "../Drawables/DrawableInterface";

export type PipelineType =
  'Line'| 'reticle' | 'Trajectory' | 'Decal';

type Pipelines = {
  type: PipelineType,
  pipeline: PipelineInterface,
}

type PipelineMapEntry = {
  pipeline: PipelineInterface,
}

class PipelineManager implements PipelineManagerInterface {
  pipelines: Pipelines[] = [];

  pipelineMap: Map<string, PipelineMapEntry> = new Map();

  constructor() {
    this.pipelines = [];
  }

  async ready() {
    const result = await gpu.ready();

    if (result) {
      this.pipelines.push({ type: 'Line', pipeline: new LinePipeline() });
      this.pipelines.push({ type: 'Decal', pipeline: new DecalPipeline() });
      this.pipelines.push({ type: 'Trajectory', pipeline: new TrajectoryPipeline() });
    }

    return result;
  }

  static layoutBindGroup(properties: PropertyInterface[], visibility: GPUShaderStageFlags, label: string) {
    if (properties.length === 0) {
      return null
    }

    // Create the bindgroup layout entries with samplers and textures, if any.
    let entries: GPUBindGroupLayoutEntry[] = [
      ...properties
        .filter((property) => ['sampler', 'texture2D'].includes(property.value.dataType))
        .map((property, index) => ({
          binding: index,
          visibility,
          sampler: property.value.dataType === 'sampler' ? {} : undefined,
          texture: property.value.dataType === 'texture2D' ? {} : undefined,
        })),
    ];

    // Add one additional bind group for the other data types. These will go into the Properties structure.
    if (properties.some((p) => !['sampler', 'texture2D'].includes(p.value.dataType))) {
      entries = entries.concat({
        binding: entries.length,
        visibility,
        buffer: {},
      })
    }

    const bindGroupDescriptor: GPUBindGroupLayoutDescriptor = {
      label,
      entries,
    };

    return gpu.device.createBindGroupLayout(bindGroupDescriptor);
  }

  async getPipeline(
    drawableType: DrawableType,
    vertexProperties: PropertyInterface[],
    graph: ShaderGraph,
    root?: GraphNodeInterface,
  ): Promise<PipelineInterface> {
    let vertStageBindings: StageBindings | null = null;
    let fragStageBindings: StageBindings | null = null;

    const key = JSON.stringify({
      drawableType,
      shaderDescriptor: graph.createShaderDescriptor(),
      root: root?.id,
    });

    const pipelineEntry: PipelineMapEntry | undefined = this.pipelineMap.get(key);

    if (pipelineEntry) {
      return pipelineEntry.pipeline
    }

    let pipeline: PipelineInterface;

    if (graph.fragment.nodes.length === 0 && graph.type) {
      const entry = this.pipelines.find((pipeline) => pipeline.type === graph.type);

      if (!entry) {
        throw new Error('pipeline not found')
      }

      pipeline = entry.pipeline

      this.pipelineMap.set(key, { pipeline });
    }
    else {
      let vertProperties: PropertyInterface[] = [];
      let fragProperties: PropertyInterface[] = [];
  
      let vertexBufferLayout: GPUVertexBufferLayout[] | undefined = undefined;

      let shaderModule: GPUShaderModule;
      let code: string;
    
      [shaderModule, vertProperties, fragProperties, code] = graph.generateShaderModule(drawableType, vertexProperties, root);

      if (drawableType === 'Mesh') {
        vertexBufferLayout = [
          {
            attributes: [
              {
                shaderLocation: 0, // position
                offset: 0,
                format: "float32x4",
              },
            ],
            arrayStride: 16,
            stepMode: "vertex",
          },
          {
            attributes: [
              {
                shaderLocation: 1, // normal
                offset: 0,
                format: "float32x4",
              }
            ],
            arrayStride: 16,
            stepMode: "vertex",
          },
          {
            attributes: [
              {
                shaderLocation: 2, // texcoord
                offset: 0,
                format: "float32x2",
              }
            ],
            arrayStride: 8,
            stepMode: "vertex",
          }
        ];
      }
      else if (drawableType === 'Mesh2D') {
        vertexBufferLayout = [
          {
            attributes: [
              {
                shaderLocation: 0, // position
                offset: 0,
                format: "float32x2",
              },
            ],
            arrayStride: 8,
            stepMode: "vertex",
          },
          {
            attributes: [
              {
                shaderLocation: 1, // texcoord
                offset: 0,
                format: "float32x2",
              }
            ],
            arrayStride: 8,
            stepMode: "vertex",
          }
        ];
      }

      const targets: GPUColorTargetState[] = [];

      if (graph.transparent) {
        targets.push({
          format: outputFormat,
          blend: {
            color: {
              srcFactor: 'src-alpha' as GPUBlendFactor,
              dstFactor: 'one-minus-src-alpha' as GPUBlendFactor,
            },
            alpha: {
              srcFactor: 'src-alpha' as GPUBlendFactor,
              dstFactor: 'one-minus-src-alpha' as GPUBlendFactor,
            },
          },
        });  
      }
      else {
        targets.push(
          {
            format: outputFormat,
          },
        )

        if (graph.lit) {
          targets.push(
            {
              format: outputFormat,
            },
            {
              format: outputFormat,
            },
          )
        }
      }

      if (!graph.lit && bloom && drawableType !== 'Mesh2D') {
        targets.push({
          format: outputFormat,
        })
      }

      const bindGroupLayouts = [
        bindGroups.getBindGroupLayout0(),
        bindGroups.getBindGroupLayout1(),
      ]

      const defs = makeShaderDataDefinitions(code);
      
      let binding = 2;

      if (vertProperties.length > 0) {
        const layout = PipelineManager.layoutBindGroup(vertProperties, GPUShaderStage.VERTEX, 'vert group');

        if (layout) {
          bindGroupLayouts.push(layout)

          vertStageBindings = {
            binding,
            layout,
            properties: vertProperties,
            structuredView: defs.structs.VertProperties ? makeStructuredView(defs.structs.VertProperties) : null,
          }

          binding += 1
        }  
      }

      if (fragProperties.length > 0) {
        const layout = PipelineManager.layoutBindGroup(fragProperties, GPUShaderStage.FRAGMENT, 'frag group')

        if (layout) {
          bindGroupLayouts.push(layout)

          fragStageBindings = {
            binding,
            layout,
            properties: fragProperties,
            structuredView: defs.structs.FragProperties ? makeStructuredView(defs.structs.FragProperties) : null,
          }

          binding += 1
        }
      }

      const pipelineLayout = gpu.device.createPipelineLayout({
        bindGroupLayouts,
      });

      const pipelineDescriptor: GPURenderPipelineDescriptor = {
        label: `${drawableType}${graph.transparent ? ' transparent' : ''}${bloom ? ' bloom' : ''} pipeline`,
        vertex: {
          module: shaderModule,
          entryPoint: "vs",
          buffers: vertexBufferLayout,
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs",
          targets,
        },
        primitive: {
          topology: "triangle-list",
          cullMode: graph.cullMode ?? 'none',
          frontFace: "ccw",
        },
        depthStencil: {
          depthWriteEnabled: graph.depthWriteEnabled ?? true,
          depthCompare: (graph.transparent ?? false) ? 'less-equal' : 'less',
          format: "depth24plus"
        },
        layout: pipelineLayout,
      };
      
      const gpuPipeline = gpu.device.createRenderPipeline(pipelineDescriptor);

      pipeline = new Pipeline(gpuPipeline, vertStageBindings, fragStageBindings);

      this.pipelineMap.set(key, { pipeline });
    }

    console.log(`pipelines created: ${this.pipelineMap.size}`)
    return pipeline;
  }
}

export const pipelineManager = new PipelineManager();

export default PipelineManager;
