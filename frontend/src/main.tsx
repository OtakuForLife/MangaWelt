import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('MangaWelt: Starting app...')

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('MangaWelt: Root element not found!')
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>'
  } else {
    console.log('MangaWelt: Root element found, rendering app...')
    createRoot(rootElement).render(
      <App />
    )
    console.log('MangaWelt: App rendered successfully')
  }
} catch (error) {
  console.error('MangaWelt: Fatal error during initialization:', error)
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Fatal Error: ${error}</div>`
}
