import './App.css'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import VoiceHire from './pages/VoiceHire.jsx'
import Feed from './pages/Feed.jsx'
import Templates from './pages/Templates.jsx'
import Candidates from './pages/Candidates.jsx'
import OfferJD from './pages/OfferJD.jsx'
import MassHiring from './pages/MassHiring.jsx'
import QRSpot from './pages/QRSpot.jsx'
import QRRegister from './pages/QRRegister.jsx'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-muted)] text-gray-900 antialiased">
      <NavBar />
      <main className="flex-1 w-full py-10">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/voice" element={<VoiceHire />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/offer" element={<OfferJD />} />
            <Route path="/mass" element={<MassHiring />} />
            <Route path="/qr" element={<QRSpot />} />
            <Route path="/qr/register" element={<QRRegister />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
