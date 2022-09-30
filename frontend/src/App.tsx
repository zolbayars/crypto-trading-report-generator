import React from 'react';
import './App.css';
import ReportTable from './components/ReportTable'

function App() {
  return (
    <div className="App">
      <div className="main-page">
        <ReportTable fromId = {null}/>
      </div>
    </div>
  );
}

export default App;
