import React from 'react';
import type { MenuItemLike } from '../ContextMenu/types';
import { useStores } from '../State/store';
import ContextMenu from '../ContextMenu/ContextMenu';
import styles from '../Project/Project.module.scss'
import SceneNode from './Types/SceneNode';
import type { NewSceneNodeComponent } from '../Renderer/Types';
import { ComponentType } from '../Renderer/Types';
import type { SceneInterface } from "./Types/Types";
import ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps';
import LightProps from '../Renderer/Properties/LightProps';
import TreeNode from './Types/TreeNode';
import { objectManager } from './Types/ObjectManager';

type PropsType = {
  scene?: SceneInterface,
}

const SceneToolbar: React.FC<PropsType> = ({
  scene,
}) => {
  const store = useStores();

  const [showMenu, setShowMenu] = React.useState<{ x: number, y: number } | null>(null);
  const ref = React.useRef<HTMLButtonElement>(null);

  const handleAddClick = () => {
    if (!showMenu) {
      const element = ref.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setShowMenu({ x: rect.left, y: rect.bottom })
      }
    }
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const textureInputRef = React.useRef<HTMLInputElement>(null);
  const modelInputRef = React.useRef<HTMLInputElement>(null);

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Create scene object', action: async () => {
      if (scene) {
        const object = new SceneNode()

        await object.save();

        const node = new TreeNode()

        node.nodeObject = object;

        await objectManager.add(node);

        scene.addNode(node);  

        scene.setSelectedObject(node);
      }
    } },
    { name: 'Create particle system', action: async () => {
      if (scene) {
        const object = new SceneNode();

        await objectManager.add(object);

        const props = new ParticleSystemProps();
        // const particleSystem = new ParticleSystem(props);

        object.addComponent({
          type: ComponentType.ParticleSystem,
          props: props,
          // component: particleSystem,
        });
  
        // await object.save();

        const node = new TreeNode()

        node.nodeObject = object;

        await objectManager.add(node);

        scene.addNode(node);

        scene.setSelectedObject(node);
      }
    } },
    { name: 'Create light', action: async () => {
      if (scene) {
        const object = new SceneNode()

        const props = new LightProps();

        const item: NewSceneNodeComponent = {
          type: ComponentType.Light,
          props: props,
        }

        object.addComponent(item);

        await object.save();

        const node = new TreeNode();

        node.nodeObject = object;

        await objectManager.add(node);

        scene.addNode(node);

        scene.setSelectedObject(node);
      }
    } }

    // { name: 'Create 2D game object', action: () => { store.project.addNewItem('object2D') } },
    // { name: 'Create particle system', action: () => { store.project.addNewItem('particle') } },
    // { name: 'Create folder', action: () => { store.project.createFolder() } },
  ]), [scene]);
  
  const handleTextureFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.project.importTexture(event.target.files[0])
    }
  }

  const handleModelFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.project.importModel(event.target.files[0])
    }
  }

  return (
    <div className={styles.toolbar}>
      <button ref={ref} type="button" onClick={handleAddClick}>+</button>
      <input
        ref={textureInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".png"
        // multiple={multiple}
        onChange={handleTextureFileSelection}
      />
      <input
        ref={modelInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".fbx"
        // multiple={multiple}
        onChange={handleModelFileSelection}
      />
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
}

export default SceneToolbar;
