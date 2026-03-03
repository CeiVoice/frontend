import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Signin from './components/auth/signin'
import Signup from './components/auth/signup'
import Layout from './page1'
import Home from './components/page/home'
import Tracking from './components/page/user'
import TrackingPage from './components/page/tracking'
import AdminPage from './components/page/AdminPage'
import AssigneePage from './components/page/dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [roles, setRoles] = useState({})
  const navigate = useNavigate()

  const handleRoleChange = (email, newRole) => {
    setRoles(prev => ({ ...prev, [email]: newRole }))
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) setIsLoggedIn(true)
  }, [])

  const handleSignout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUserEmail('')
    navigate('/signin', { replace: true })
  }

  const handleSignin = (email) => {
    setUserEmail(email)
    setIsLoggedIn(true)
    navigate('/home', { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/signin"
        element={
          isLoggedIn
            ? <Navigate to="/home" replace />
            : <Signin onSuccess={handleSignin} onRegister={() => navigate('/signup')} />
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn
            ? <Navigate to="/home" replace />
            : <Signup onBack={() => navigate('/signin')} />
        }
      />
      <Route
        path="/"
        element={
          isLoggedIn
            ? <Layout userEmail={userEmail} onSignout={handleSignout} roles={roles} onRoleChange={handleRoleChange} />
            : <Navigate to="/signin" replace />
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<AssigneePage />} />
        <Route path="user" element={<Tracking />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/signin'} replace />} />
    </Routes>
  )
}

export default App
