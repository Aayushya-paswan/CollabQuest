import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Login from './components/Login/Login';
import Layout from './Layout';
import Home from './components/Home/Home';
import Register from './components/Register/Register';
import AllContextProvider from './context/AllContextProvider';
import { Route } from 'react-router-dom';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />}/>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        {/* 404 Route */}
        <Route path='*' element={<div>element not found</div>} />
      </Route>
    </Route>
  )
);

const AppWithProviders = () => (
  <AllContextProvider>
    <RouterProvider router={router} />
  </AllContextProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);