export const vertexOut = /*wgsl*/`
  struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) color : vec4f,
    @location(1) texcoord: vec2f,
  }
`
