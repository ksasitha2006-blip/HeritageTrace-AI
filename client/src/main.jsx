import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#140e09',
          color: '#f5ebe0',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
          duration: 3500,
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
          duration: 4000,
        },
      }}
    />
    <App />
  </StrictMode>,
)
