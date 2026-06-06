import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import Portada from './pages/Portada'
import Tarea9Page from './pages/Tarea9Page'
import CarouselPage from './pages/CarouselPage'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <header className="p-4 bg-white/80 border-b">
        <nav className="max-w-6xl mx-auto flex gap-4">
          <Link to="/" className="font-semibold text-indigo-600">Portada</Link>
          <Link to="/tarea9" className="font-semibold">Tarea 9</Link>
          <Link to="/carousel" className="font-semibold">Carousel</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Portada />} />
        <Route path="/tarea9" element={<Tarea9Page />} />
        <Route path="/carousel" element={<CarouselPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
