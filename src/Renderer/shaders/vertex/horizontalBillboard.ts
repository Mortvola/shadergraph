import { vertexOut } from "./vertexOut";

export const HorizontalBillboard = /*wgsl*/`
  ${vertexOut}

  @vertex
  fn vs(
    @builtin(instance_index) instanceIndex: u32,
    @builtin(vertex_index) vertexIndex : u32,
  ) -> VertexOut
  {
    let verts = array(
      vec4f(-1.0, 0, 1.0, 1),
      vec4f(-1.0, 0, -1.0, 1),
      vec4f(1.0, 0, 1.0, 1),
      vec4f(1.0, 0, 1.0, 1),
      vec4f(-1.0, 0, -1.0, 1),
      vec4f(1.0, 0, -1.0, 1),
    );

    let texcoords = array(
      vec2f(0.0, 1.0),
      vec2f(0.0, 0.0),
      vec2f(1.0, 1.0),
      vec2f(1.0, 1.0),
      vec2f(0.0, 0.0),
      vec2f(1.0, 0.0),
    );

    var output : VertexOut;

    // scale and/or rotate the vertex vector
    var vertexVector = modelMatrix[instanceIndex] * verts[vertexIndex];

    // Get world origin point by taking the fourth vector from the
    // model-to-world transformation matrix
    var origin = vec4f(modelMatrix[instanceIndex][3].xyz, 1);

    // Now transform the origin into camera space and add 
    // the vertex vector.
    // var pos = viewMatrix * origin + vertexVector;
    var pos = viewMatrix * vertexVector;

    output.position = projectionMatrix * pos;

    output.color = instanceInfo[instanceIndex].color;
    output.texcoord = texcoords[vertexIndex];
    return output;
  }
`
