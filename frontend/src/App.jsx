import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import ZonePage from './pages/ZonePage'
import InsightsPage from './pages/InsightsPage'
import PredictorPage from './pages/PredictorPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/zones/:id" element={<ZonePage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/predict" element={<PredictorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
