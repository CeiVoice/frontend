import { useState } from 'react'
import './App.css'
import Login from './components/login'
import Signin from './components/signin'
import Page1 from './page1'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)//set true to test page1
  const [screen, setScreen] = useState('login')

  if (isLoggedIn) {
    return <Page1 />
  }

  if (screen === 'signin') {
    return <Signin onBack={() => setScreen('login')} />
  }

  return (
    <Login
      onSuccess={() => setIsLoggedIn(true)}
      onRegister={() => setScreen('signin')}
    />
  )
}

export default App
