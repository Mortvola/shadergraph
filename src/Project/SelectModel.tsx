import React from 'react';
import Http from '../Http/src';
import Modal from '../Modal';
import styles from './SelectModel.module.scss';
import SelectModelEntry from './SelectModelEntry';

type PropsType = {
  onSelection: (selection: { id: number, name: string }) => void,
}

const SelectModel: React.FC<PropsType> = ({
  onSelection,
}) => {
  const [models, setModels] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/models-list');

    if (response.ok) {
      const list = await response.body()

      setModels(list);
    }
  }

  const ref = React.useRef<HTMLButtonElement>(null);
  const [showModels, setShowModels] = React.useState<boolean>(false);
  const [position, setPostion] = React.useState<{ x: number, y: number }>({ x: 0, y: 0});

  const handleSelectModel = () => {
    const element = ref.current;

    if (element) {
      queryList()

      const rect = element.getBoundingClientRect();

      setPostion({ x: rect.right, y: rect.bottom });
      setShowModels(true)
    }
  }

  const handleHideModels = () => {
    setShowModels(false);
  }

  return (
    <>
      <button ref={ref} type="button" onClick={handleSelectModel}>Add</button>
      <Modal show={showModels} onHide={handleHideModels}>
        <div className={styles.list} style={{ left: position.x, top: position.y }}>
          {
            models.map((s) => (
              <SelectModelEntry key={s.id} model={s} onSelection={onSelection} />
            ))
          }              
        </div>
      </Modal>
    </>
  )
}

export default SelectModel;
