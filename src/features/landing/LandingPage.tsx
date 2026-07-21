import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import './LandingPage.css';

type IconName =
  | 'arrow'
  | 'calendar'
  | 'chat'
  | 'check'
  | 'clock'
  | 'doctor'
  | 'heart'
  | 'location'
  | 'search'
  | 'shield'
  | 'sparkles';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    doctor: <><path d="M9 4H6a2 2 0 0 0-2 2v3a5 5 0 0 0 10 0V6a2 2 0 0 0-2-2h-1" /><path d="M9 14v2a4 4 0 0 0 8 0v-1" /><circle cx="18" cy="12" r="2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    sparkles: <><path d="m12 3-1.2 3.2L8 7.5l2.8 1.3L12 12l1.2-3.2L16 7.5l-2.8-1.3Z" /><path d="m18.5 14-.8 2.2-2.2.8 2.2.8.8 2.2.8-2.2 2.2-.8-2.2-.8Z" /><path d="m5.5 12-.7 1.8-1.8.7 1.8.7.7 1.8.7-1.8 1.8-.7-1.8-.7Z" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

const patientServices = [
  {
    icon: 'search' as const,
    title: 'Encuentra la atención correcta',
    description: 'Explora especialidades y centros de salud según lo que necesitas.',
  },
  {
    icon: 'calendar' as const,
    title: 'Consulta datos útiles',
    description: 'Revisa horarios, servicios disponibles y costos referenciales.',
  },
  {
    icon: 'chat' as const,
    title: 'Recibe orientación clara',
    description: 'Haz preguntas en lenguaje cotidiano y obtén una guía fácil de entender.',
  },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" to="/" aria-label="Utamedic, inicio">
          <span className="landing-brand__mark" aria-hidden="true"><span /><span /></span>
          <span>Uta<span>medic</span></span>
        </Link>

        <nav className="landing-nav" aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#como-funciona">Cómo funciona</a>
          <Link to="/teleconsulta">Teleconsulta</Link>
          <a href="#profesionales">Para médicos</a>
        </nav>

        <Link className="landing-header__cta" to="/asistente">
          Probar asistente <Icon name="arrow" />
        </Link>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__content">
            <div className="landing-eyebrow"><span><Icon name="sparkles" /></span> Salud digital, simple y cercana</div>
            <h1>Tu salud, más clara.<br /><span>Tu atención, más cerca.</span></h1>
            <p className="landing-hero__lead">
              Utamedic te ayuda a encontrar servicios de salud y resolver dudas generales
              con una orientación comprensible, segura y disponible cuando la necesitas.
            </p>
            <div className="landing-hero__actions">
              <Link className="landing-button landing-button--primary" to="/asistente">
                Hablar con el asistente <Icon name="arrow" />
              </Link>
              <Link className="landing-button landing-button--ghost" to="/gestion">
                Entrar a gestión <Icon name="arrow" />
              </Link>
              <a className="landing-button landing-button--ghost" href="#como-funciona">Conoce cómo funciona</a>
            </div>
            <div className="landing-trust" aria-label="Beneficios del servicio">
              <span><Icon name="shield" /> Información protegida</span>
              <span><Icon name="clock" /> Disponible 24/7</span>
            </div>
          </div>

          <div className="landing-hero__visual" aria-label="Vista previa del asistente Utamedic">
            <div className="landing-orbit landing-orbit--one" />
            <div className="landing-orbit landing-orbit--two" />
            <div className="landing-float-card landing-float-card--location">
              <span><Icon name="location" /></span>
              <div><small>Centro cercano</small><strong>A 8 minutos de ti</strong></div>
            </div>
            <div className="landing-float-card landing-float-card--verified">
              <span><Icon name="shield" /></span>
              <div><strong>Orientación segura</strong><small>Información clara y responsable</small></div>
            </div>
            <div className="assistant-preview">
              <div className="assistant-preview__topbar">
                <div className="assistant-preview__identity">
                  <span className="assistant-preview__avatar"><Icon name="heart" /></span>
                  <div><strong>Asistente Utamedic</strong><small><i /> En línea</small></div>
                </div>
                <span className="assistant-preview__dots">•••</span>
              </div>
              <div className="assistant-preview__body">
                <div className="assistant-message assistant-message--bot">
                  ¡Hola! Soy tu asistente de salud. ¿En qué puedo orientarte hoy?
                  <small>10:24</small>
                </div>
                <div className="assistant-message assistant-message--user">
                  Busco un centro de cardiología cerca de mí
                  <small>10:25</small>
                </div>
                <div className="assistant-result">
                  <div className="assistant-result__icon"><Icon name="location" /></div>
                  <div>
                    <small>Encontré opciones para ti</small>
                    <strong>3 centros cercanos</strong>
                    <span>Ver centros y horarios <Icon name="arrow" /></span>
                  </div>
                </div>
              </div>
              <div className="assistant-preview__composer">
                <span>Escribe tu consulta...</span>
                <b><Icon name="arrow" /></b>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-proof" aria-label="Características principales">
          <div><strong>24/7</strong><span>Orientación disponible</span></div>
          <i />
          <div><strong>En segundos</strong><span>Respuestas fáciles de entender</span></div>
          <i />
          <div><strong>Dos experiencias</strong><span>Para pacientes y profesionales</span></div>
        </section>

        <section className="landing-section" id="servicios">
          <div className="landing-section__heading">
            <p className="landing-kicker">Todo en un solo lugar</p>
            <h2>Te orientamos para dar el<br />siguiente paso con confianza</h2>
            <p>Información útil para tomar mejores decisiones sobre tu atención y la de tu familia.</p>
          </div>
          <div className="landing-service-grid">
            {patientServices.map((service, index) => (
              <article className="landing-service-card" key={service.title}>
                <span className="landing-service-card__number">0{index + 1}</span>
                <div className="landing-service-card__icon"><Icon name={service.icon} /></div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/asistente" aria-label={`${service.title}: abrir asistente`}>
                  Explorar ahora <Icon name="arrow" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how" id="como-funciona">
          <div className="landing-how__visual">
            <div className="landing-how__pulse"><Icon name="heart" /></div>
            <div className="landing-how__card landing-how__card--one"><Icon name="chat" /><span><strong>Cuéntanos qué necesitas</strong><small>Escribe tu duda con tus propias palabras</small></span></div>
            <div className="landing-how__card landing-how__card--two"><Icon name="sparkles" /><span><strong>Recibe una guía clara</strong><small>Con opciones útiles para continuar</small></span></div>
            <div className="landing-how__cross" aria-hidden="true"><span /><span /></div>
          </div>
          <div className="landing-how__content">
            <p className="landing-kicker">Así de fácil</p>
            <h2>Una conversación puede acercarte a la atención que buscas</h2>
            <ol>
              <li><span>1</span><div><strong>Inicia una conversación</strong><p>Sin formularios complicados ni términos difíciles.</p></div></li>
              <li><span>2</span><div><strong>Describe lo que necesitas</strong><p>Pregunta por centros, especialidades, horarios o costos.</p></div></li>
              <li><span>3</span><div><strong>Revisa tus opciones</strong><p>Obtén información organizada para decidir tu próximo paso.</p></div></li>
            </ol>
            <Link className="landing-text-link" to="/asistente">Comenzar ahora <Icon name="arrow" /></Link>
          </div>
        </section>

        <section className="landing-pro" id="profesionales">
          <div className="landing-pro__copy">
            <p className="landing-kicker landing-kicker--light">También para profesionales</p>
            <h2>Más claridad clínica.<br />Más tiempo para tus pacientes.</h2>
            <p>Un espacio de apoyo que organiza la información clínica, genera resúmenes y acompaña la revisión profesional sin reemplazar tu criterio médico.</p>
            <ul>
              <li><span><Icon name="check" /></span> Resúmenes clínicos estructurados</li>
              <li><span><Icon name="check" /></span> Contexto del paciente en un solo lugar</li>
              <li><span><Icon name="check" /></span> Apoyo para la revisión diferencial</li>
            </ul>
            <Link className="landing-button landing-button--light" to="/medico/copiloto">Conocer el copiloto médico <Icon name="arrow" /></Link>
          </div>
          <div className="landing-pro__visual">
            <div className="doctor-preview">
              <div className="doctor-preview__head"><span><Icon name="doctor" /></span><div><small>Resumen del paciente</small><strong>María Fernández</strong></div><b>Revisión</b></div>
              <div className="doctor-preview__stats"><div><small>Edad</small><strong>42 años</strong></div><div><small>Última consulta</small><strong>Hoy, 09:30</strong></div><div><small>Estado</small><strong className="is-stable">Estable</strong></div></div>
              <div className="doctor-preview__summary"><div><span /><span /><span /></div><p><strong>Resumen generado</strong><br />Paciente con antecedentes registrados y evolución clínica disponible para revisión.</p></div>
              <div className="doctor-preview__tags"><span>Antecedentes</span><span>Signos vitales</span><span>Laboratorios</span></div>
            </div>
          </div>
        </section>

        <section className="landing-final">
          <span className="landing-final__icon"><Icon name="heart" /></span>
          <p className="landing-kicker">Empieza hoy</p>
          <h2>Tu próxima decisión de salud<br />puede comenzar con una pregunta.</h2>
          <p>Estamos aquí para ayudarte a encontrar información y orientación de forma simple.</p>
          <Link className="landing-button landing-button--primary" to="/asistente">Hablar con el asistente <Icon name="arrow" /></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand landing-brand--footer">
          <span className="landing-brand__mark" aria-hidden="true"><span /><span /></span>
          <span>Uta<span>medic</span></span>
        </div>
        <p>Orientación de salud clara, humana y accesible.</p>
        <nav aria-label="Enlaces del pie de página"><Link to="/asistente">Asistente</Link><Link to="/teleconsulta">Teleconsulta</Link><Link to="/medico/copiloto">Profesionales</Link><a href="#servicios">Servicios</a></nav>
        <small>© 2026 Utamedic. La información brindada no reemplaza una evaluación médica profesional.</small>
      </footer>
    </div>
  );
}
