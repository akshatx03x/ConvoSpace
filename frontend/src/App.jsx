import React, { useState, useEffect } from 'react'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/DashBoard/dashboard'
import Subscriptions from './components/DashBoard/subscriptions'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import axios from 'axios'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !user) {
        setIsAuthenticated(false)
        return
      }

      try {
        // Validate token with backend
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/validate-token`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        })
        setIsAuthenticated(true)
      } catch (error) {
        // Token is invalid, clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      }
    }

    validateToken()
  }, [token, user])

  if (isAuthenticated === null) {
    // Loading state while validating
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/subscriptions' element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
