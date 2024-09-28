import { vertexOut } from "./vertexOut";

export const circle = /*wgsl*/`
  ${vertexOut}

  @vertex
  fn vs(
    @builtin(instance_index) instanceIndex: u32,
    @builtin(vertex_index) vertexIndex : u32,
  ) -> VertexOut
  {
    var output : VertexOut;

    var segment = vertexIndex / 6;
    var segmentVertIndex = vertexIndex % 6;

    var pi = 3.14159;
    var radiansPerSegment = pi * 2 / vertProperties.numSegments;

    var radians = f32(segment) * radiansPerSegment;

    var x: f32;
    var y: f32;

    var radius = vertProperties.radius;
    var thickness = vertProperties.thickness;

    if (segmentVertIndex == 0) {
      x = (radius - thickness) * cos(radians);
      y = (radius - thickness) * sin(radians);
    }
    else if (segmentVertIndex == 1 || segmentVertIndex == 4) {
      x = (radius) * cos(radians);
      y = (radius) * sin(radians);
    }
    else if (segmentVertIndex == 2 || segmentVertIndex == 3) {
      x = (radius - thickness) * cos(radians + radiansPerSegment);
      y = (radius - thickness) * sin(radians + radiansPerSegment);
    }
    else if (segmentVertIndex == 5) {
      x = (radius) * cos(radians + radiansPerSegment);
      y = (radius) * sin(radians + radiansPerSegment);
    }

    output.position = projectionMatrix * viewMatrix * modelMatrix[instanceIndex] * vec4f(x, y, 0, 1);

    output.color = instanceInfo[instanceIndex].color;

    return output;
  }
`
