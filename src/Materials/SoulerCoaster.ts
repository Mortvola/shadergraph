import { MaterialDescriptor } from "./MaterialDescriptor";

export const soulerCoasterMaterial: MaterialDescriptor = {
  type: 'Lit',

  cullMode: 'none',

  texture: {
    url: './textures/stars.png',

    scale: [1, 5],

    offset: [0, 0.1],
  },

  graph: {
    vertex: {
      nodes: [],
      edges: [],
    },

    fragment: {
      nodes: [
        { id: 0, type: 'property', dataType: 'string', value: './textures/stars.png' },
        { id: 3, type: 'uv' },
        { id: 1, type: 'SampleTexture' },
        { id: 2, type: 'display' },
        { id: 4, type: 'TileAndScroll' },
        { id: 5, type: 'property', name: 'tile', dataType: 'vec2f', value: [1, 5] },
        { id: 6, type: 'property', name: 'scroll', dataType: 'vec2f', value: [0, 1] },
        { id: 7, type: 'Multiply' },
        { id: 8, type: 'time' },
      ],

      edges: [
        [{ graphNodeId: 3, port: 'uv'  }, { graphNodeId: 4, port: 'uv' }],
        [{ graphNodeId: 5, port: 'tile'}, { graphNodeId: 4, port: 'tile' }],
        [{ graphNodeId: 6, port: 'scroll'}, { graphNodeId: 7, port: 'A' }],
        [{ graphNodeId: 8, port: 'time'}, { graphNodeId: 7, port: 'B' }],
        [{ graphNodeId: 7, port: 'result'}, { graphNodeId: 4, port: 'scroll' }],
        [{ graphNodeId: 4, port: 'result'}, { graphNodeId: 1, port: 'uv' }],
        [{ graphNodeId: 1, port: 'sample' }, { graphNodeId: 2, port: 'fragment' }],
        [{ graphNodeId: 0, port: ''  }, { graphNodeId: 1, port: 'texture' }],
      ]
    }
  }
}
