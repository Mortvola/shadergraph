import { vertexOut } from "./vertexOut";

export const twoD = /*wgsl*/`
  struct Dimensions {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
  }

  @group(1) @binding(0) var<uniform> instanceColor: array<vec4f, 1000>;
  @group(1) @binding(1) var<uniform> dimensions: array<Dimensions, 1000>;

  ${vertexOut}

  @vertex
  fn vs(
    @builtin(instance_index) instanceIndex: u32,
    @builtin(vertex_index) vertexIndex : u32,
  ) -> VertexOut
  {
    var output : VertexOut;
    
    var vertex = vec4(0.0, 0.0, 0, 1);

    if (vertexIndex == 0 || vertexIndex == 5) {
      vertex.x = dimensions[instanceIndex].x + dimensions[instanceIndex].width;
      vertex.y = dimensions[instanceIndex].y * aspectRatio;
      output.texcoord.x = 1.0;
      output.texcoord.y = 0.0;
    }
    else if (vertexIndex == 1) {
      vertex.x = dimensions[instanceIndex].x;
      vertex.y = dimensions[instanceIndex].y * aspectRatio;
      output.texcoord.x = 0.0;
      output.texcoord.y = 0.0;
    }
    else if (vertexIndex == 2 || vertexIndex == 3) {
      vertex.x = dimensions[instanceIndex].x;
      vertex.y = (dimensions[instanceIndex].y - dimensions[instanceIndex].height) * aspectRatio;
      output.texcoord.x = 0.0;
      output.texcoord.y = 1.0;
    }
    else if (vertexIndex == 4) {
      vertex.x = dimensions[instanceIndex].x + dimensions[instanceIndex].width;
      vertex.y = (dimensions[instanceIndex].y - dimensions[instanceIndex].height) * aspectRatio;
      output.texcoord.x = 1.0;
      output.texcoord.y = 1.0;
    }

    output.position = vertex;
    output.color = instanceColor[instanceIndex];

    return output;
  }
`
