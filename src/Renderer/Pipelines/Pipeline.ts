import { type ShaderModuleSettings } from "../ShaderBuilder/Types";
import type { PipelineInterface, StageBindings } from "../Types";

class Pipeline implements PipelineInterface {
  pipeline: GPURenderPipeline;

  vertexStageBindings: StageBindings | null

  fragmentStageBindings: StageBindings | null

  settings: ShaderModuleSettings

  constructor(
    pipeline: GPURenderPipeline,
    vertexStageBindings: StageBindings | null,
    fragmentStageBindings: StageBindings | null,
    settings: ShaderModuleSettings,
  ) {
    this.pipeline = pipeline;
    this.vertexStageBindings = vertexStageBindings
    this.fragmentStageBindings = fragmentStageBindings
    this.settings = settings
  }
}

export default Pipeline;
