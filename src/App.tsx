import { useState } from 'react'
import heroImg from './assets/hero.png'
import './App.css'
import VideoCall from './VideoCall'
import ContactWidget from './ContactWidget'

function App() {
  return (
    <>
      {/* HEADER */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <div>
              <span className="logo-title">CloudHealth</span>
              <span className="logo-sub">La Paz</span>
            </div>
          </div>

          <div className="header-hospital">
            <span className="hospital-badge">🏥</span>
            <span>Hospital Municipal La Merced</span>
          </div>

          <div className="header-user">
            <span className="user-avatar">👤</span>
            <span>Médico</span>
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* HERO PERSONALIZADO */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">🏥 Teleconsulta</span>

            <h1>
              Atención médica digital para los ciudadanos de{' '}
              <span className="hero-highlight">La Paz</span>
            </h1>

            <p>
              Conéctate con profesionales de la salud desde cualquier lugar,
              de forma segura y eficiente.
            </p>
          </div>
        </section>

        <VideoCall />

        <ContactWidget />

        <div className="ticks"></div>

        <section id="spacer"></section>

        {/* FOOTER PERSONALIZADO */}
        <footer className="app-footer">
          <div className="footer-inner">
            <p>© 2026 CloudHealth La Paz · Todos los derechos reservados</p>

            <div className="footer-links">
              <a href="#">Términos</a>
              <a href="#">Privacidad</a>
              <a href="#">Contacto</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}

export default App