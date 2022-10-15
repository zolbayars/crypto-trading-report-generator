import React from 'react';
import './App.css';
import TradesTable from './components/TradesTable'

function App() {
  return (
    <div className="App">
      <div className="main-page">
        <TradesTable fromId = {null}/>
      </div>
    </div>
  );
}

export default App;
