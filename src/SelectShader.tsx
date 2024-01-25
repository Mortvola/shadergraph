import React from 'react';
import Http from './Http/src';
import Modal from './Modal';
import styles from './SelectShader.module.scss';
import SelectShaderEntry from './SelectShaderEntry';

type PropsType = {
  onSelection: (id: number) => void,
}

const SelectShader: React.FC<PropsType> = ({
  onSelection,
}) => {
  const [shaders, setShaders] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/shader-list');

    if (response.ok) {
      const list = await response.body()

      setShaders(list);
    }
  }

  const ref = React.useRef<HTMLButtonElement>(null);
  const [showShaders, setShowShaders] = React.useState<boolean>(false);
  const [position, setPostion] = React.useState<{ x: number, y: number }>({ x: 0, y: 0});

  const handleSelectShader = () => {
    const element = ref.current;

    if (element) {
      queryList()

      const rect = element.getBoundingClientRect();

      setPostion({ x: rect.right, y: rect.bottom });
      setShowShaders(true)
    }
  }

  const handleHideShaders = () => {
    setShowShaders(false);
  }

  return (
    <>
      <button ref={ref} type="button" onClick={handleSelectShader}>Add</button>
      <Modal show={showShaders} onHide={handleHideShaders}>
        <div className={styles.list} style={{ left: position.x, top: position.y }}>
          {
            shaders.map((s) => (
              <SelectShaderEntry  key={s.id} shader={s} onSelection={onSelection} />
            ))
          }              
        </div>
      </Modal>
    </>
  )
}

export default SelectShader;
