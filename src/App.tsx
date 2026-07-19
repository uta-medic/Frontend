import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import VideoCall from './VideoCall'
import ContactWidget from './ContactWidget'

function App() {
  const [count, setCount] = useState(0)

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

        {/* ---------- TODO EL CONTENIDO ORIGINAL ---------- */}

        <section id="center">
          <div className="hero">
            <img
              src={heroImg}
              className="base"
              width="170"
              height="179"
              alt=""
            />
            <img
              src={reactLogo}
              className="framework"
              alt="React logo"
            />
            <img
              src={viteLogo}
              className="vite"
              alt="Vite logo"
            />
          </div>

          <div>
            <h1>Get started</h1>

            <p>
              Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
            </p>
          </div>

          <button
            type="button"
            className="counter"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
        </section>

        {/* COMPONENTES ORIGINALES */}
        <VideoCall />

        <ContactWidget />

        <div className="ticks"></div>

        <section id="next-steps">
          <div id="docs">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon"></use>
            </svg>

            <h2>Documentation</h2>

            <p>Your questions, answered</p>

            <ul>
              <li>
                <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                  <img className="logo" src={viteLogo} alt="" />
                  Explore Vite
                </a>
              </li>

              <li>
                <a href="https://react.dev/" target="_blank" rel="noreferrer">
                  <img className="button-icon" src={reactLogo} alt="" />
                  Learn more
                </a>
              </li>
            </ul>
          </div>

          <div id="social">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>

            <h2>Connect with us</h2>

            <p>Join the Vite community</p>

            <ul>
              <li>
                <a
                  href="https://github.com/vitejs/vite"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="button-icon">
                    <use href="/icons.svg#github-icon"></use>
                  </svg>
                  GitHub
                </a>
              </li>

              <li>
                <a
                  href="https://chat.vite.dev/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="button-icon">
                    <use href="/icons.svg#discord-icon"></use>
                  </svg>
                  Discord
                </a>
              </li>

              <li>
                <a
                  href="https://x.com/vite_js"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="button-icon">
                    <use href="/icons.svg#x-icon"></use>
                  </svg>
                  X.com
                </a>
              </li>

              <li>
                <a
                  href="https://bsky.app/profile/vite.dev"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="button-icon">
                    <use href="/icons.svg#bluesky-icon"></use>
                  </svg>
                  Bluesky
                </a>
              </li>
            </ul>
          </div>
        </section>

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