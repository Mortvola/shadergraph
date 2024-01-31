import React from 'react';
import './App.scss';
import MainView from './MainView';
import { observer } from 'mobx-react-lite';

const App: React.FC = observer(() => {
  return (
    <MainView />
  )
})

export default App;
