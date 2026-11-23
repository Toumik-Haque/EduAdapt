import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SpaceProvider } from './context/SpaceContext'
import { ModalProvider } from './context/ModalContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SpaceProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </SpaceProvider>
    </AuthProvider>
  </StrictMode>,
)