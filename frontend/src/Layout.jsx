import React from 'react'
import {Outlet} from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Loading from './components/Loading/Loading'

function Layout() {
  return (
    <>
      <Navbar />
      <main className="fade-in">
        <Outlet/>
      </main>
      <Loading />
    </>
  )
}

export default Layout