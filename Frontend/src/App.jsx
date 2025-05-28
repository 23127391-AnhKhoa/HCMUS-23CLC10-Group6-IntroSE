import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';



function App() {
  return (
    <Router>
      
      <div className="App">
        <ExplorePage />
      </div>
    </Router>
  );
}

export default App;