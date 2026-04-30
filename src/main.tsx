import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { ChatWidgetProvider } from './lib/widget-context'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
