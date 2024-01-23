import React from 'react';
import Http from './Http/src';
import Modal from './Modal';
import styles from './OpenShader.module.scss';

type PropsType = {
}

const OpenShader: React.FC<PropsType> = ({
}) => {
  const [shaders, setShaders] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/shader-list');

    if (response.ok) {
      const list = await response.body()

      setShaders(list);
      console.log(list)
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const ref = React.useRef<HTMLButtonElement>(null);
  const [showShaders, setShowShaders] = React.useState<boolean>(false);
  const [position, setPostion] = React.useState<{ x: number, y: number }>({ x: 0, y: 0});

  const handleOpenShader = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setPostion({ x: rect.left, y: rect.bottom });
      setShowShaders(true)
    }
  }

  const handleHideShaders = () => {
    setShowShaders(false);
  }

  return (
    <>
      <button ref={ref} type="button" className="save-button" onClick={handleOpenShader}>Open</button>
      <Modal show={showShaders} onHide={handleHideShaders}>
        <div className={styles.list} style={{ left: position.x, top: position.y }}>
          {
            shaders.map((s) => (
              <div>{s.name}</div>
            ))
          }              
        </div>
      </Modal>
    </>
  )
}

export default OpenShader;
