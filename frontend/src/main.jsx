import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import App from './App'
import GuestMenuPage from './features/guest/GuestMenuPage'
import './index.css'

/**
 * Routing:
 * - /menu/:slug/ban/:tableId  → GuestMenuPage (public, không cần login)
 * - /*                        → App (dashboard chính)
 */

function GuestMenuWrapper() {
  const { slug, tableId } = useParams()
  return <GuestMenuPage slug={slug} tableId={tableId} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:slug/ban/:tableId" element={<GuestMenuWrapper />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
