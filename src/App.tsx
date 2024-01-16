import React from 'react';
import './App.scss';
import Container from './Container';
import { StoreContext, store } from './State/store';

const App: React.FC = () => (
  <StoreContext.Provider value={store}>
    <Container />
  </StoreContext.Provider>
);

export default App;
