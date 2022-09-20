import React from 'react';
import './App.css';
import ReportTable from './components/ReportTable'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ReportTable fromId = {null}/>
      </header>
    </div>
  );
}

export default App;
