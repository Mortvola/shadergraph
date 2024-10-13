import { type NodeType } from "../ShaderBuilder/GraphDescriptor";
import { BlendMode, CullMode } from "../ShaderBuilder/Types";
import { type ShaderDescriptor } from "./ShaderDescriptor";

export const litDescriptor: ShaderDescriptor = {
  properties: [],
  graphDescriptor: {
    vertex: {
      nodes: [],
      edges: []
    },
    fragment: {
      nodes: [
        {
          id: 1,
          type: 'Display' as NodeType,
          portValues: [
            {
              port: 'rgb',
              value: [
                0.5,
                0.5,
                0.5,
                1
              ]
            },
            {
              port: 'a',
              value: 0
            }
          ],
          settings: {
            transparent: false,
            blendMode: BlendMode.Alpha,
            cullMode: CullMode.None,
            depthWriteEnabled: true,
            lit: true
          }
        }
      ],
      edges: []
    }
  }
}
