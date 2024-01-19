import { bindGroups } from "../BindGroups";
import { gpu } from "../Gpu";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import Property from "../shaders/ShaderBuilder/Property";
import { generateShaderModule } from "../shaders/ShaderBuilder/ShaderBuilder";
import { PropertyInterface } from "../shaders/ShaderBuilder/Types";
import { litShader } from "../shaders/lit";
import { PipelineInterface, PipelineManagerInterface } from "../types";
import CirclePipeline from "./CirclePipeline";
import LinePipeline from "./LinePipeline";
import LitPipeline from "./LitPipeline";
import OutlinePipeline from "./OutlinePipeline";
import Pipeline from "./Pipeline";
// import ReticlePipeline from "./ReticlePipeline";
import TrajectoryPipeline from "./TrajectoryPipeline";

export type PipelineType =
  'Lit' | 'pipeline' | 'Line' | 'billboard' | 'drag-handles' | 'Circle' | 'outline' | 'reticle' |
  'Trajectory';

type Pipelines = {
  type: PipelineType,
  pipeline: PipelineInterface,
}

type PipelineMapEntry = {
  pipeline: PipelineInterface,
  bindgroupLayout: GPUBindGroupLayout | null,
  properties: Property[],
}

class PipelineManager implements PipelineManagerInterface {
  // private static instance: PipelineManager | null = null;

  pipelines: Pipelines[] = [];

  pipelineMap: Map<string, PipelineMapEntry> = new Map();

  constructor() {
    this.pipelines = [];
  }

  async ready() {
    const result = await gpu.ready();

    if (result) {
      this.pipelines.push({ type: 'Lit', pipeline: new LitPipeline() });
      // this.pipelines.push({ type: 'pipeline', pipeline: new Pipeline() })
      this.pipelines.push({ type: 'Line', pipeline: new LinePipeline() });
      // this.pipelines.push({ type: 'billboard', pipeline: new BillboardPipeline() });
      // this.pipelines.push({ type: 'drag-handles', pipeline: new DragHandlesPipeline() });
      this.pipelines.push({ type: 'Circle', pipeline: new CirclePipeline() });
      this.pipelines.push({ type: 'outline', pipeline: new OutlinePipeline() });
      // this.pipelines.push({ type: 'reticle', pipeline: new ReticlePipeline() });
      this.pipelines.push({ type: 'Trajectory', pipeline: new TrajectoryPipeline() });
    }

    return result;
  }

  // public static getInstance(): PipelineManager {
  //   if (PipelineManager.instance === null) {
  //     PipelineManager.instance = new PipelineManager();
  //   }

  //   return this.instance!
  // }

  getPipeline(type: PipelineType): PipelineInterface | null {
    const entry = this.pipelines.find((pipeline) => pipeline.type === type);

    if (entry) {
      return entry.pipeline;
    }

    console.log(`pipeline ${type} not found.`)

    return null;
  }

  getPipelineByArgs(materialDescriptor: MaterialDescriptor): [PipelineInterface, GPUBindGroupLayout | null, PropertyInterface[]] {
    let properties: Property[] = [];
    let bindgroupLayout: GPUBindGroupLayout | null = null;

    const key = JSON.stringify(materialDescriptor);

    let pipelineEntry: PipelineMapEntry | undefined = this.pipelineMap.get(key);

    if (pipelineEntry) {
      return [pipelineEntry.pipeline, pipelineEntry.bindgroupLayout, pipelineEntry.properties];
    }

    let pipeline: PipelineInterface;

    if (!materialDescriptor.graph) {
      pipeline = this.getPipeline(materialDescriptor.type)!

      this.pipelineMap.set(key, { pipeline, bindgroupLayout: null, properties: [] });
    }
    else {
      let shaderModule: GPUShaderModule;
      let vertexBufferLayout: GPUVertexBufferLayout[] = [];

      [shaderModule, properties] = generateShaderModule(materialDescriptor);  

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

      let target: GPUColorTargetState = {
        format: navigator.gpu.getPreferredCanvasFormat(),
      }

      if (materialDescriptor.transparent) {
        target = {
          format: navigator.gpu.getPreferredCanvasFormat(),
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
        };  
      }

      bindgroupLayout = gpu.device.createBindGroupLayout({
        label: 'group2',
        entries: [
          { // Color
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {},
          },
          ...properties.map((property, index) => ({
            binding: index + 1,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: property.value.dataType === 'sampler' ? {} : undefined,
            texture: property.value.dataType === 'texture2D' ? {} : undefined,
          })),
          { // Attributes
            binding: properties.length + 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {},
          },
        ]
      });

      const pipelineLayout = gpu.device.createPipelineLayout({
        bindGroupLayouts: [
          bindGroups.getBindGroupLayout0(),
          bindGroups.getBindGroupLayout1(),
          bindgroupLayout,
        ],
      });

      const pipelineDescriptor: GPURenderPipelineDescriptor = {
        label: 'base pipeline',
        vertex: {
          module: shaderModule,
          entryPoint: "vs",
          buffers: vertexBufferLayout,
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs",
          targets: [target],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: materialDescriptor.cullMode,
          frontFace: "ccw",
        },
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less",
          format: "depth24plus"
        },
        layout: pipelineLayout,
      };
      
      const gpuPipeline = gpu.device.createRenderPipeline(pipelineDescriptor);

      pipeline = new Pipeline();
      pipeline.pipeline = gpuPipeline;

      this.pipelineMap.set(key, { pipeline, bindgroupLayout, properties });
    }

    console.log(`pipelines created: ${this.pipelineMap.size}`)
    return [pipeline, bindgroupLayout, properties];
  }
}

export const pipelineManager = new PipelineManager();

export default PipelineManager;
