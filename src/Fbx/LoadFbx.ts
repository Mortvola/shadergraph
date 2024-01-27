import * as FBXParser from 'fbx-parser'
import { vec3 } from 'wgpu-matrix';
import SurfaceMesh from '../Renderer/Drawables/SurfaceMesh';
import { degToRad } from '../Renderer/Math';
import FbxNode from './FbxNode';
import FbxGeometryNode from './FbxGeometryNode';
import FbxContainerNode from './FbxContainerNode';
import Http from '../Http/src';

// export const yieldToMain = () => {
//   return new Promise(resolve => {
//     setTimeout(resolve, 0);
//   });
// }

const loadGeometry = async (
  geometry: FBXParser.FBXReaderNode,
  geoPctComplete: (pct: number) => void,
): Promise<SurfaceMesh | undefined> => {
  const vertices = geometry?.node('Vertices')?.prop(0, 'number[]') ?? [];
  const indexes = geometry?.node('PolygonVertexIndex')?.prop(0, 'number[]') ?? [];
  const normalsNode = geometry?.node('LayerElementNormal');
  const uvNode = geometry?.node('LayerElementUV');

  const normals = normalsNode
    ?.node('Normals')
    ?.prop(0, 'number[]') ?? [];

  const mappingInformationType = normalsNode
    ?.node('MappingInformationType')
    ?.prop(0, 'string');

  const referenceInformationType = normalsNode
    ?.node('ReferenceInformationType')
    ?.prop(0, 'string');

  const uv = uvNode
    ?.node('UV')
    ?.prop(0, 'number[]') ?? [];

  const uvIndex = uvNode
    ?.node('UVIndex')
    ?.prop(0, 'number[]') ?? [];

  const uvMappingInformationType = uvNode
    ?.node('MappingInformationType')
    ?.prop(0, 'string');

  const uvReferenceInformationType = uvNode
    ?.node('ReferenceInformationType')
    ?.prop(0, 'string');


  if (vertices.length !== 0 && indexes.length !== 0) {
    const m = new SurfaceMesh();

    let index: number[] = [];

    for (let i = 0; i < indexes.length; i += 1) {
      if (indexes[i] >= 0) {
        index.push(indexes[i]);
      }
      else {
        index.push(-indexes[i] - 1);

        const v: number[] = [];

        for (let n = 0; n < index.length; n += 1) {
          const texcoord: number[] = [];
          const norms: number[] = [];

          const offset = i + 1 - index.length + n;

          if(
            uvMappingInformationType === 'ByPolygonVertex'
            && uvReferenceInformationType === 'IndexToDirect'
          ) {
            texcoord.push(uv[uvIndex[offset] * 2 + 0])
            texcoord.push(uv[uvIndex[offset] * 2 + 1])
          }
    
          if (
            mappingInformationType === 'ByPolygonVertex'
            && referenceInformationType === 'Direct'
          ) {
            norms.push(normals[(offset) * 3 + 0])
            norms.push(normals[(offset) * 3 + 1])
            norms.push(normals[(offset) * 3 + 2])
          }
  
          v[n] = m.addVertex(
            vertices[index[n] * 3 + 0],
            vertices[index[n] * 3 + 1],
            vertices[index[n] * 3 + 2],
            norms,
            texcoord,
          )
        }

        // let norms: number[] | undefined = undefined;

        // if (
        //   mappingInformationType === 'ByPolygonVertex'
        //   && referenceInformationType === 'Direct'
        // ) {
        //   norms = [
        //     ...normals.slice((i + 1 - index.length) * 3, (i + 1) * 3)
        //   ]
        // }

        m.addFace(v)

        index = [];
      }
    }

    return m;
  }
}

const addTransformProperties = (sceneNode: FbxNode, node: FBXParser.FBXReaderNode) => {
  const [scaling] = node.node('Properties70')?.nodes({ 0: "Lcl Scaling" }) ?? [];
  const [trans] = node.node('Properties70')?.nodes({ 0: "Lcl Translation"}) ?? [];
  const [rot] = node.node('Properties70')?.nodes({ 0: "Lcl Rotation"}) ?? [];

  const scaleFactor = 1 / 10;

  const xScale = (scaling?.prop(4, 'number') ?? 1) * scaleFactor;
  const yScale = (scaling?.prop(5, 'number') ?? 1) * scaleFactor;
  const zScale = (scaling?.prop(6, 'number') ?? 1) * scaleFactor;

  const xRotation = rot?.prop(4, 'number') ?? 0;
  const yRotation = rot?.prop(5, 'number') ?? 0;
  const zRotation = rot?.prop(6, 'number') ?? 0;

  const xTranslation = (trans?.prop(4, 'number') ?? 0) * scaleFactor;
  const yTranslation = (trans?.prop(5, 'number') ?? 0) * scaleFactor;
  const zTranslation = (trans?.prop(5, 'number') ?? 0) * scaleFactor;

  sceneNode.scale = vec3.create(xScale, yScale, zScale); 
  sceneNode.setFromAngles(degToRad(xRotation), degToRad(yRotation), degToRad(zRotation));
  sceneNode.translate = vec3.create(xTranslation, yTranslation, zTranslation); 
}

type Result = {
  sceneNodes: FbxNode[],
}

type Context = {
  totalOOConnections: number,
  connectionsProcessedCount: number,
  connectionsProcessed: [string, number, number, string][],
  unhandled: Record<string, number>,
}

type NodeNode = {
  name: string,
}

type Node = {
  name: string,
  descriptor: string,
  type: string,
  connections: Node[],
  nodes: NodeNode[],
}

// let yieldIterations = 0;

const objectsVisited: Record<string, number> = {};

const traverseTree = async (
  context: Context,
  parent: Node,
  objectsNode: FBXParser.FBXReaderNode,
  connectionsNode: FBXParser.FBXReaderNode,
  objectId: number,
  setPercentComplete: (pct: number) => void,
  geoPctComplete: (pct: number | null) => void,
): Promise<Result> => {
  const result: Result = {
    sceneNodes: [],
  };

  const connections = connectionsNode?.nodes({ 2: objectId }) ?? [];

  for (let connection of connections) {
    const connectedObjectId = connection.prop(1, 'number');
    const type = connection.prop(3, 'string') ?? '';
    const c = connection.prop(0, 'string') ?? '';

    // Did we already process this connection?
    const processed = context.connectionsProcessed.find(
      (p) => p[0] === c && p[1] === connectedObjectId && p[2] === objectId && p[3] === type
    );

    if (processed) {
      continue;
    }

    if (connectedObjectId) {
      const nodes = objectsNode?.nodes({ 0: connectedObjectId }) ?? [];

      const node = nodes[0];

      if (node) {
        const type = node.prop(2, 'string') ?? '';

        const n: Node = {
          name: node.fbxNode.name,
          descriptor: node.prop(1, 'string') ?? '',
          type,
          connections: [],
          nodes: [],
        }

        n.nodes = node.fbxNode.nodes.map((nd) => ({
          name: nd.name,
        }))

        parent.connections.push(n);

        const result2 = await traverseTree(context, n, objectsNode, connectionsNode, connectedObjectId, setPercentComplete, geoPctComplete);

        objectsVisited[connectedObjectId] = (objectsVisited[connectedObjectId] ?? 0) + 1;

        switch (node.fbxNode.name) {
          case 'Geometry': {
            const geometry = await loadGeometry(node, geoPctComplete);
  
            if (geometry) {
              const results = await geometry.generateBuffers();

              const geometryNode = new FbxGeometryNode(geometry, results.vertices, results.normals, results.texcoords, results.indices);
              
              geometryNode.name =  node.prop(1, 'string')?.split('::')[1] ?? '';
              if (geometryNode.name === '') {
                geometryNode.name = node.prop(2, 'string') ?? 'Unknown';
              }

              addTransformProperties(geometryNode, node);

              result.sceneNodes.push(geometryNode);
            }
  
            geoPctComplete(null);

            break;
          }
        
          case 'Model': {
            const model = new FbxContainerNode();

            addTransformProperties(model, node);

            model.name =  node.prop(1, 'string')?.split('::')[1] ?? 'Unknown';

            if (result2.sceneNodes) {
              for (const sceneNode of result2.sceneNodes) {
                if (sceneNode.name === '') {
                  sceneNode.name = "Unknown";
                }

                model.addNode(sceneNode);
                // if (isDrawableInterface(sceneNode)) {
                  // renderer?.mainRenderPass.addDrawable(sceneNode);              
                // }
              }
            }

            result.sceneNodes.push(model)

            break;
          }

          default: {
            const model = new FbxContainerNode();

            // model.name =  node.prop(1, 'string')?.split('::')[1] ?? 'Unknown';
            model.name =  node.prop(1, 'string') ?? 'Unknown';

            addTransformProperties(model, node);

            if (result2.sceneNodes) {
              for (const sceneNode of result2.sceneNodes) {
                // if (sceneNode.name === '') {
                //   sceneNode.name = "Unknown";
                // }

                model.addNode(sceneNode);
                // if (isDrawableInterface(sceneNode)) {
                  // renderer?.mainRenderPass.addDrawable(sceneNode);              
                // }
              }
            }

            result.sceneNodes.push(model)

            if (context.unhandled[node.fbxNode.name]) {
              context.unhandled[node.fbxNode.name] += 1;
            }
            else {
              context.unhandled[node.fbxNode.name] = 1;
            }

            break;
          }
        }
      }

      context.connectionsProcessed.push([c, connectedObjectId, objectId, type])
      context.connectionsProcessedCount += 1;  
  
      setPercentComplete(context.connectionsProcessedCount / context.totalOOConnections)
    }
    else {
      console.log('Connected object Id not found.')
    }

    // yieldIterations += 1;

    // if (yieldIterations > 500) {
    //   // await yieldToMain();
    //   yieldIterations = 0;
    // }
  }

  return result;
}

export const downloadFbx = async (url: string): Promise<FbxNode | undefined> => {
  try {
    const res = await Http.get(url);
    const blob = await res.blob();

    const arrayBuffer = await blob.arrayBuffer();

    let fbx: FBXParser.FBXData;
    try {
      const buffer = new Uint8Array(arrayBuffer)
      fbx = FBXParser.parseBinary(buffer)
    }
    catch (error) {
      var dataView = new DataView(arrayBuffer);
      const decoder = new TextDecoder();
      const text = decoder.decode(dataView);
      // console.log(text[0]);
      fbx = FBXParser.parseText(text);
    }

    const root = new FBXParser.FBXReader(fbx);

    // const upAxis = root.node('GlobalSettings')?.node('Properties70')?.node('P', { 0: 'UpAxis' })?.prop(4, 'number')

    const connectionsNode = root.node('Connections');

    if (connectionsNode) {
      const objectsNode = root.node('Objects');

      if (objectsNode) {
        type ConnectionEdge = {
          type: string,
          objectId: number,
          parentObjectId: number,
          subType: string,
          visited: boolean,
        }
        let edges: ConnectionEdge[] = [];

        for (const node of connectionsNode.fbxNode.nodes) {
          const type = node.props[0] as string;
          const id1 = node.props[1] as number;
          const id2 = node.props[2] as number;
          const subType = node.props[3] as string ?? '';

          const edge = edges.find((e) => e.type === type && e.objectId === id1 && e.parentObjectId === id2 && e.subType === subType)

          if (edge) {
            console.log(`duplicate edge: ${edge}`)
          }
          else {
            edges.push({ type, objectId: id1, parentObjectId: id2, subType, visited: false })
          }
        }

        // Traverse the graph and mark the edges that have been visisted.
        // Once done, filter out the edges that were never visited.
        const stack: number[] = [0];

        while (stack.length > 0) {
          const parentId = stack.pop()

          for (const edge of edges) {
            if (!edge.visited && edge.parentObjectId === parentId) {
              edge.visited = true;
              stack.push(edge.objectId);
            }
          }  
        }

        const priorCount = edges.length;

        // Reports which edges were not visisted.
        edges.filter((edge) => !edge.visited).forEach((e) => {
          const obj = objectsNode.node({ 0: e.objectId});
          const parent = objectsNode.node({ 0: e.parentObjectId});

          console.log(`${obj?.fbxNode.name}, parent: ${e.parentObjectId}: ${parent?.fbxNode.name}`);
        });

        // Keep only the visited edges.
        edges = edges.filter((edge) => edge.visited);
        console.log(`edges removed: ${priorCount - edges.length}`)
        
        const context: Context = {
          totalOOConnections: edges.length,
          connectionsProcessedCount: 0,
          connectionsProcessed: [],
          unhandled: {},
        }
        
        // setPercentComplete(0);

        // await yieldToMain()

        const rootNode: Node = {
          name: 'Root',
          descriptor: '',
          type: '',
          connections: [],
          nodes: [],
        }

        const result = await traverseTree(
          context,
          rootNode,
          objectsNode,
          connectionsNode,
          0,
          (pct: number | null) => {}, // setPercentComplete(pct),
          (pct: number | null) => {}, // setGeoPercent(pct),
        );

        // for (const sceneNode of result.sceneNodes) {
          // renderer?.document.addNode(sceneNode);  
        // }
  
        // Report what objects were not visited.
        for (const node of objectsNode.fbxNode.nodes) {
          const id = node.props[0] as number;

          if (objectsVisited[id] === undefined) {
            console.log(`object not visited: ${id}, ${node.name}`)
          }
        }

        for (const [key, value] of Object.entries(context.unhandled)) {
          console.log(`${key}: ${value}`)
        }

        // setPercentComplete(null);
        // setGeoPercent(null);

        if (result.sceneNodes.length === 1) {
          return result.sceneNodes[0];
        }

        const containerNode = new FbxContainerNode();
        
        for (const node of result.sceneNodes) {
          containerNode.addNode(node);
        }

        return containerNode;
      }
    }
  }
  catch (error) {
    console.log(error);
  }    
};
