import { vertexOut } from './vertexOut';

export const mesh2D = /*wgsl*/`
  @group(1) @binding(0) var<uniform> transform: array<mat3x3f, 1000>;
  @group(1) @binding(1) var<uniform> instanceColor: array<vec4f, 1000>;

  struct Vertex {
    @location(0) position: vec2f,
    @location(1) texcoord: vec2f,
  }

  ${vertexOut}

  @vertex
  fn vs(
    @builtin(instance_index) instanceIndex: u32,
    vertex: Vertex,
  ) -> VertexOut
  {
    var output : VertexOut;

    var point = transform[instanceIndex] * vec3f(vertex.position, 1);

    output.position = vec4f(point.xy, 0, 1);
    output.texcoord = vertex.texcoord;
    output.color = instanceColor[instanceIndex];

    return output;
  }
`
