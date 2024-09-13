import React from 'react';
import styles from './MainView.module.scss';
import Canvas3d from './Canvas3d';
import { store, useStores } from './State/store';
import Inspector from './Inspector/Inspector';
import Project from './Project/Project';
import ShaderEditor from './ShaderEditor/ShaderEditor';
import { observer } from 'mobx-react-lite';
import Scene from './Scene/Scene';

const MainView: React.FC = observer(() => {
  const { mainView, scene, project } = useStores();
  
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      mainView?.camera.changeOffset(event.deltaY * 0.01);
    }
    else {
      mainView?.camera.changeRotation(event.deltaX * 0.2, event.deltaY * 0.2)
    }

    event.stopPropagation();
  }

  return (
    <div className={styles.main}>
      <div>
        {
          store.graph
          ? <ShaderEditor graph={store.graph} />
          : (
            <>
              <Canvas3d renderer={mainView} onWheel={handleWheel} />
              <Inspector />
            </>
          )
        }
      </div>
      <div className={styles.sidebar}>
        <Scene scene={scene} />
        <Project project={project} />
      </div>
    </div>
  )
})

export default MainView;
