import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ADD THE REDIRECT PROPS HERE TO FIX THE SIGNUP BUG */}
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        afterSignOutUrl="/login"
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>,
)