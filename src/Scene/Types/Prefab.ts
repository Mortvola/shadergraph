import TransformProps from "../../Renderer/Properties/TransformProps";
import Entity from "../../State/Entity";
import type { SceneObjectInterface } from "./Types";
import type { SceneObjectBaseInterface } from "./Types";
import type { PrefabDescriptor } from "./Types";
import type { PrefabInterface } from "./Types";
import PrefabNode from "./PrefabNode";
import Http from "../../Http/src";

class Prefab extends Entity implements PrefabInterface {
  root?: PrefabNode;

  autosave = true;

  constructor(id?: number, name?: string, root?: PrefabNode) {
    super(id, name ?? `PrefabObject ${Math.abs(id ?? 0)}`)
    this.root = root;
  }

  static fromDescriptor(descriptor: PrefabDescriptor) {
    const prefabObject = new Prefab();

    prefabObject.autosave = false;

    if (descriptor) {
      prefabObject.id = descriptor.id;
      prefabObject.name = descriptor.name;

      if (descriptor.prefab.root) {
        prefabObject.root = PrefabNode.fromDescriptor(prefabObject, descriptor.prefab.root)
      }
    }

    prefabObject.autosave = true;

    return prefabObject;
  }

  static fromSceneObject(startingObject: SceneObjectInterface): Prefab | undefined {
    const id = 0;

    const prefab = new Prefab(-1, this.name);

    prefab.addSceneObjects(startingObject, id, null);

    return prefab;
  }

  addSceneObjects(startingObject: SceneObjectInterface, id: number, parentNode: PrefabNode | null): PrefabNode {
    let stack: { object: SceneObjectBaseInterface, parent: PrefabNode | null }[] = [{ object: startingObject, parent: parentNode }];

    let root: PrefabNode | undefined = undefined;

    while (stack.length > 0) {
      const { object, parent } = stack[0];
      stack = stack.slice(1);

      const prefabNode = new PrefabNode(this, id);
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
      if (!this.root) {
        prefabNode.transformProps = new TransformProps({
          translate: [...object.transformProps.translate.get()],
          rotate: [...object.transformProps.rotate.get()],
          scale: [...object.transformProps.scale.get()],
        }, prefabNode.onChange);

        this.root = prefabNode;
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
        node: prefabNode,
      }))

      // Link the prefabObject with its parent.
      if (parent) {
        prefabNode.parentNode = parent;
        parent.nodes.push(prefabNode)
      }
      
      if (!root) {
        root = prefabNode;
      }
    }

    if (root === undefined) {
      throw new Error('root not defined')
    }

    this.save()
    
    return root;
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

  async save(): Promise<void> {
    console.log('prefab save')
    if (this.id < 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...descriptor } = this.toDescriptor();

      const response = await Http.post<Omit<PrefabDescriptor, 'id'>, PrefabDescriptor>(`/api/prefabs`, descriptor);

      if (response.ok) {
        const body = await response.body();

        if (body.id !== undefined) {
          this.id = body.id;
        }
      }  
    }
    else {
      const descriptor = this.toDescriptor();

      const response = await Http.patch<PrefabDescriptor, void>(`/api/prefabs/${this.id}`, descriptor);

      if (response.ok) { /* empty */ }  
    }      
  }

}

export default Prefab;
