import React, { useState } from 'react';
//import './App.css';
import { Routes } from "react-router"
import { BrowserRouter as Router, Route, Navigate } from "react-router-dom";
import Login from './components/Login/Login';
import Layout from './Layout';
import Home from './components/Home/Home';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          {/* 404 Route */}
          <Route path="*" element={<div>element not found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;