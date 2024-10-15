import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Http from './Http/src';
import { DateTime } from 'luxon';
import styles from './OpenProjectDialog.module.scss';

type PropsType = {
  show?: boolean
  onHide?: () => void,
  onSelect?: (id: number) => void,
}

const OpenProjectDialog: React.FC<PropsType> = ({
  show = false,
  onHide,
  onSelect,
}) => {
  type ProjectEntry = {
    id: number,
    name: string,
    date: DateTime,
  }
  const [projects, setProjects] = React.useState<ProjectEntry[] | undefined>()

  React.useEffect(() => {
    if (show) {
      (
        async () => {
          const response = await Http.get<{ id: number, name: string, date: string }[]>('/api/projects')

          if (response.ok) {
            const body = await response.body()

            const entries: ProjectEntry[] = body.map((entry) => ({
              id: entry.id,
              name: entry.name,
              date: DateTime.fromISO(entry.date),
            }))

            setProjects(entries)
          }
        }
      )()
    }
  }, [show])

  const handleSelect = (id: number) => {
    console.log(`selected: ${id}`)

    if (onSelect) {
      onSelect(id)
    }
  }

  const handleCancel = () => {
    if (onHide) {
      onHide()
    }
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Open Project</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {
          projects?.map((project) => (
            <div key={project.id} className={styles.project} onDoubleClick={() => { handleSelect(project.id)}}>
              <div>{project.name}</div>
              <div>{project.date.toLocaleString({ dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
          ))
        }
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
        <Button variant="primary">Open</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OpenProjectDialog;
