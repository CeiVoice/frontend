import { useState } from 'react'
import './App.css'
import Login from './components/login'
import Page1 from './page1'

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(true) //set true to test page1

  return (
    <>
      {isLoggedIn ? <Page1 /> : <Login onSuccess={() => setIsLoggedIn(true)} />}
    </>
  )
}

export default App
