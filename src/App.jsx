import { useEffect, useState } from 'react'
import './App.css'
import Signin from './components/signin'
import Signup from './components/signup'
import Page1 from './page1'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)//set true to test page1
  const [screen, setScreen] = useState('signin') // 'signin' or 'signup'
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleSignout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUserEmail('')
    setScreen('signin')
  }

  if (isLoggedIn) {
    return <Page1 userEmail={userEmail} onSignout={handleSignout} />
  }

  if (screen === 'signup') {
    return <Signup onBack={() => setScreen('signin')} />
  }

  return (
    <Signin
      onSuccess={(email) => {
        setUserEmail(email)
        setIsLoggedIn(true)
      }}
      onRegister={() => setScreen('signup')}
    />
  )
}

export default App
