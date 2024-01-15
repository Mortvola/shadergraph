import { bindGroups } from "../BindGroups";
import { gpu } from "../Gpu";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import { litShader } from "../shaders/lit";
import { texturedShader } from "../shaders/textured";
import { PipelineInterface, PipelineManagerInterface } from "../types";
import CirclePipeline from "./CirclePipeline";
import LinePipeline from "./LinePipeline";
import LitPipeline from "./LitPipeline";
import OutlinePipeline from "./OutlinePipeline";
import Pipeline from "./Pipeline";
import { buildFromGraph } from "../shaders/ShaderBuilder/ShaderBuilder";
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

  getPipelineByArgs(materialDescriptor: MaterialDescriptor): PipelineInterface {
    const key = JSON.stringify(materialDescriptor);

    let pipeline: PipelineInterface | undefined = this.pipelineMap.get(key);

    if (pipeline) {
      return pipeline;
    }

    if (materialDescriptor.type !== 'Lit') {
      pipeline = this.getPipeline(materialDescriptor.type)!

      this.pipelineMap.set(key, pipeline);
    }
    else {      
      let bindgroupLayout: GPUPipelineLayout;
      let shaderModule: GPUShaderModule;
      let vertexBufferLayout: GPUVertexBufferLayout[] = [];

      if (materialDescriptor.texture) {
        bindgroupLayout = gpu.device.createPipelineLayout({
          bindGroupLayouts: [
            bindGroups.getBindGroupLayout0(),
            bindGroups.getBindGroupLayout1(),
            bindGroups.getBindGroupLayout2(),
          ],
        });

        shaderModule = buildFromGraph(materialDescriptor);
        // shaderModule = gpu.device.createShaderModule({
        //   label: 'base pipeline',
        //   code: texturedShader,
        // })

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
      else {
        bindgroupLayout = gpu.device.createPipelineLayout({
          bindGroupLayouts: [
            bindGroups.getBindGroupLayout0(),
            bindGroups.getBindGroupLayout1(),
            bindGroups.getBindGroupLayout2A(),
          ],
        });

        shaderModule = gpu.device.createShaderModule({
          label: 'base pipeline',
          code: litShader,
        })

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
          }
        ];
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
          targets: [
            {
              format: navigator.gpu.getPreferredCanvasFormat(),
            },
          ],
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
    return pipeline;
  }
}

export const pipelineManager = new PipelineManager();

export default PipelineManager;
