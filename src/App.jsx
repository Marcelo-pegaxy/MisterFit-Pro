import './App.css'
import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './pages'
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </Router>
  )
}

export default App