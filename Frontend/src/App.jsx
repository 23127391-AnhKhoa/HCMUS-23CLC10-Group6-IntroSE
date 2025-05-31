import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';
import Footer from './Common/Footer';



function App() {
  return (
    <Router>
      
      <div className="App">
        <ExplorePage />
      </div>
      <Footer />
    </Router>
    
  );
}

export default App;