import { gpu } from "./Gpu";
// import { modelManager } from "./ModelManager";
import { pipelineManager } from "./Pipelines/PipelineManager";
import Renderer from "./Renderer";
import { WorldInterface } from "./types";

await gpu.ready();
await pipelineManager.ready();
// await modelManager.ready();
export const renderer = await Renderer.create();

export const getWorld = (): WorldInterface => renderer;
