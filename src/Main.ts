import { gpu } from "./Renderer/Gpu";
import Renderer2d from "./Renderer2d";
import { pipelineManager } from "./Renderer/Pipelines/PipelineManager";
import Renderer from "./Renderer/Renderer";
import { WorldInterface } from "./Renderer/types";

await gpu.ready();
await pipelineManager.ready();
export const renderer = await Renderer.create();
export const renderer2d = new Renderer2d();

export const getWorld = (): WorldInterface => renderer;
