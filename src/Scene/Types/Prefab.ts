import { vec3 } from "wgpu-matrix";
import TransformProps from "../../Renderer/Properties/TransformProps";
import Entity from "../../State/Entity";
import { PrefabDescriptor, PrefabInterface, SceneObjectBaseInterface, SceneObjectInterface } from "../../State/types";
import PrefabNode from "./PrefabNode";

class Prefab extends Entity implements PrefabInterface {
  root?: PrefabNode;

  constructor(id?: number, name?: string, root?: PrefabNode) {
    super(id, name ?? `PrefabObject ${Math.abs(id ?? 0)}`)
    this.root = root;
  }

  static async fromDescriptor(descriptor: PrefabDescriptor) {
    const prefabObject = new Prefab();

    if (descriptor) {
      prefabObject.id = descriptor.id;
      prefabObject.name = descriptor.name;

      if (descriptor.prefab.root) {
        prefabObject.root = await PrefabNode.fromDescriptor(prefabObject, descriptor.prefab.root)
      }
    }

    return prefabObject;
  }

  static fromSceneObject(startingObject: SceneObjectInterface): Prefab | undefined {
    // Traverse the object tree and clone each of the nodes. We will need to
    // 1. Move the scene node from the original nodes to the new ones
    // 2. Reference the properties for each of the components found in the original nodes
    // 3. Mark the link from the parent to this need as a prefab connection.
    let stack: { object: SceneObjectBaseInterface, parent: PrefabNode | null }[] = [{ object: startingObject, parent: null }];
    let id = 0;

    const prefab = new Prefab(-1, this.name);

    while (stack.length > 0) {
      let { object, parent } = stack[0];
      stack = stack.slice(1);

      const prefabNode = new PrefabNode(prefab, id);
      id += 1;

      // Add the current objects children to the stack
      stack = stack.concat(object.objects.map((o) => ({
        object: o,
        parent: prefabNode,
      })));

      prefabNode.name = object.name;

      // Set the transform values (translate, rotate and scale)
      // The root node will get its own copy while all the other nodes
      // will reference the prefab's value.
      if (!prefab.root) {
        prefabNode.transformProps = new TransformProps({
          translate: [...object.transformProps.translate],
          rotate: [...object.transformProps.rotate],
          scale: [...object.transformProps.scale],
        }, prefabNode.onChange);

        prefab.root = prefabNode;
      }
      else {
        // Have the prefab object referencd the object's transform props.
        // Set the onChange method on the transform props to the ROOT prefab object.
        prefabNode.transformProps = object.transformProps;
        // prefabNode.transformProps.onChange = prefab.root.onChange
      }

      // Add a reference to each of the components found in the original node.
      prefabNode.components = object.components.map((item) => ({
        id: item.id,
        type: item.type,
        props: item.props,
      }))

      // Link the prefabObject with its parent.
      if (parent) {
        prefabNode.parentNode = parent;
        parent.nodes.push(prefabNode)
      }

      // object.prefabNode = prefabNode;
    }

    return prefab;
  }

  toDescriptor(): PrefabDescriptor {
    return ({
      id: this.id,
      name: this.name,
      prefab: {
        root: this.root?.toDescriptor(),
      }
    })
  }
}

export default Prefab;
