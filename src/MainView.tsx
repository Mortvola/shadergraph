import React from 'react';
import styles from './MainView.module.scss';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import Inspector from './Inspector/Inspector';
import Project from './Project/Project';
import ShaderEditor from './ShaderEditor/ShaderEditor';
import { observer } from 'mobx-react-lite';
import Scene from './Scene/Scene';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Http from './Http/src';
import OpenProjectDialog from './OpenProjectDialog';
import { runInAction } from 'mobx';
import { Button, Container } from 'react-bootstrap';
import { PauseIcon, PlayIcon, SkipBack } from 'lucide-react';

const MainView: React.FC = observer(() => {
  const store = useStores();
  const { mainView, scene, project } = store;

  const [showDialog, setShowDialog] = React.useState<boolean>(false)
  
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      mainView?.camera.changeOffset(event.deltaY * 0.01);
    }
    else {
      mainView?.camera.changeRotation(event.deltaX * 0.2, event.deltaY * 0.2)
    }

    event.stopPropagation();
  }

  const handleNewClick = () => {
    (
      async () => {
        const response = await Http.post<void, { id: number }>('/api/projects')

        if (response.ok) {
          const body = await response.body();

          if (scene) {
            scene.removeScene()
          }
      
          project.open(body.id)
          localStorage.setItem('projectId', body.id.toString())      
        }
      }
    )()
  }

  const handleOpenClick = () => {
    setShowDialog(true)
  }

  const handleHideDialog = () => {
    setShowDialog(false)
  }

  const handleSelect = (id: number) => {
    if (scene) {
      scene.removeScene()
    }

    project.open(id)
    localStorage.setItem('projectId', id.toString())

    setShowDialog(false);
  }

  const handleShaderHide = () => {
    runInAction(() => {
      store.graph = null;
    })
  }

  const handlePlayClick = () => {
    store.mainView.clock.togglePlay()
  }

  const handleRestartClick = () => {
    store.mainView.clock.restart()
  }

  return (
    <>
        {
          store.graph
          ? <ShaderEditor graph={store.graph} onHide={handleShaderHide} />
          : (
            <>
              <div className={styles.main}>
                <Navbar className={styles.menubar}>
                  <Container fluid>
                    <Nav>
                      <NavDropdown title="Project">
                        <NavDropdown.Item eventKey="New" onClick={handleNewClick}>New</NavDropdown.Item>
                        <NavDropdown.Item eventKey="Open" onClick={handleOpenClick}>Open</NavDropdown.Item>
                      </NavDropdown>
                    </Nav>
                    <div>
                      <Button
                          className={styles.button}
                          variant="secondary"
                          onClick={handleRestartClick}
                        >
                        <SkipBack strokeWidth={1.25} />
                      </Button>
                      <Button
                        className={styles.button}
                        variant="secondary"
                        onClick={handlePlayClick}
                      >
                        {store.mainView.clock.paused ? <PlayIcon strokeWidth={1.25} /> : <PauseIcon strokeWidth={1.25} />}
                      </Button>
                    </div>
                  </Container>
                </Navbar>
                <Canvas3d renderer={mainView} onWheel={handleWheel} />
                <Inspector selectedItem={project.selectedItem} selectedNode={scene?.selectedNode} />
                <div className={styles.sidebar}>
                  <Scene scene={scene} />
                  <Project project={project} />
                </div>
              </div>
              <OpenProjectDialog show={showDialog} onHide={handleHideDialog} onSelect={handleSelect} />
            </>
          )
        }
    </>
  )
})

export default MainView;
