import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Layout from './Layout';
import Home from './components/Home/Home';
import Register from './components/Register/Register';
import Verification from './components/Verification/Verification';
import CompatiblePartners from './components/Partners/CompatiblePartners';
import Profile from './components/Profile/Profile';
import AllContextProvider from './context/AllContextProvider';
import Users from './components/Users/Users';
import UserDetail from './components/UserDetail/UserDetail';
import Chat from './components/Chat/Chat';
import ChatWindow from './components/ChatWindow/ChatWindow';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />}/>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='verification' element={<Verification />} />
        <Route path='partners' element={<CompatiblePartners />} />
        <Route path='profile' element={<Profile />} />
        <Route path='users' element={<Users />} />
        <Route path='users/:id' element={<UserDetail />} />
        {/* 404 Route */}
          <Route path='chat' element={<Chat />} />
          <Route path='chat/:convId' element={<ChatWindow />} />
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