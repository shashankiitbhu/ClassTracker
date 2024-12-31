import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Timetable from './components/Timetable';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/drugs" element={<DrugList />} /> */}
        <Route path="/timetable" element={<Timetable />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
