import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Signin from './components/auth/signin'
import Signup from './components/auth/signup'
import Layout from './page1'
import Tracking from './components/page/user'
import TrackingPage from './components/page/tracking'
import AdminPage from './components/page/AdminPage'
import AssigneePage from './components/page/dashboard'
import AdminActivity from './components/page/admin_activity'
import Userdashboard from './components/page/userdashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'))
  const [userEmail, setUserEmail] = useState('')
  const [roles, setRoles] = useState({})
  const navigate = useNavigate()

  const handleRoleChange = (email, newRole) => {
    setRoles(prev => ({ ...prev, [email]: newRole }))
  }

  const handleSignout = () => {
    localStorage.clear()
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
        <Route path="home" element={<TrackingPage />} />
        <Route path="dashboard" element={<AssigneePage />} />
        <Route path="user" element={<Tracking />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin-activity" element={<AdminActivity />} />
        <Route path="my-dashboard" element={<Userdashboard />} />
      </Route>
      <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/signin'} replace />} />
    </Routes>
  )
}

export default App
