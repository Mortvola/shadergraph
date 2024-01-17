import { bindGroups } from "../BindGroups";
import { gpu } from "../Gpu";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import { buildGraph, generateShaderModule } from "../shaders/ShaderBuilder/ShaderBuilder";
import StageProperty from "../shaders/ShaderBuilder/StageProperty";
import { StagePropertyInterface } from "../shaders/ShaderBuilder/Types";
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

class PipelineManager implements PipelineManagerInterface {
  // private static instance: PipelineManager | null = null;

  pipelines: Pipelines[] = [];

  pipelineMap: Map<string, PipelineInterface> = new Map();

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

  getPipelineByArgs(materialDescriptor: MaterialDescriptor): [PipelineInterface, StagePropertyInterface[]] {
    let properties: StageProperty[] = [];

    const key = JSON.stringify(materialDescriptor);

    let pipeline: PipelineInterface | undefined = this.pipelineMap.get(key);

    if (pipeline) {
      return [pipeline, properties];
    }

    if (!materialDescriptor.graph) {
      pipeline = this.getPipeline(materialDescriptor.type)!

      this.pipelineMap.set(key, pipeline);
    }
    else {      
      let bindgroupLayout: GPUPipelineLayout;
      let shaderModule: GPUShaderModule;
      let vertexBufferLayout: GPUVertexBufferLayout[] = [];

      bindgroupLayout = gpu.device.createPipelineLayout({
        bindGroupLayouts: [
          bindGroups.getBindGroupLayout0(),
          bindGroups.getBindGroupLayout1(),
          bindGroups.getBindGroupLayout2(),
        ],
      });

      const graph = buildGraph(materialDescriptor.graph);
      shaderModule = generateShaderModule(graph);  

      properties = graph.properties;

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
          cullMode: materialDescriptor.cullMode ?? "back",
          frontFace: "ccw",
        },
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less",
          format: "depth24plus"
        },
        layout: bindgroupLayout,
      };
      
      const gpuPipeline = gpu.device.createRenderPipeline(pipelineDescriptor);

      pipeline = new Pipeline();
      pipeline.pipeline = gpuPipeline;

      this.pipelineMap.set(key, pipeline);
    }

    console.log(`pipelines created: ${this.pipelineMap.size}`)
    return [pipeline, properties];
  }
}

export const pipelineManager = new PipelineManager();

export default PipelineManager;
