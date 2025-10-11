import React from 'react'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
