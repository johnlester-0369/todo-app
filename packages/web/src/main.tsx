import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { getInitialTheme, applyTheme } from '@/utils/theme.util'
import App from '@/App'

// Ensure theme is set before React renders (synchronous init)
const initTheme = () => {
  const theme = getInitialTheme()
  applyTheme(theme)
}
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
