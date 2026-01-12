import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EmailAuthApp from './index';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmailAuthApp />
  </StrictMode>,
)
