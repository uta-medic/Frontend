import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderAssistant() {
  window.history.pushState({}, '', '/asistente');
  return { user: userEvent.setup(), ...render(<App />) };
}

async function sendMessage(message: string) {
  const user = userEvent.setup();
  const composer = screen.getByLabelText('Escribe tu mensaje');
  await user.type(composer, message);
  await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  return user;
}

describe('agente IA para usuarios', () => {
  it('1. renderiza la ruta /asistente', () => {
    renderAssistant();

    expect(
      screen.getByRole('heading', { name: 'Asistente Utamedic' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no reemplazo una evaluación médica/i),
    ).toBeInTheDocument();
  });

  it('2. muestra el mensaje inicial del asistente', () => {
    renderAssistant();

    expect(
      screen.getByText(/Hola, soy el Asistente Utamedic/i),
    ).toBeInTheDocument();
  });

  it('3. ofrece seis acciones rápidas y las envía mediante el hook', async () => {
    const { user } = renderAssistant();

    expect(screen.getAllByRole('button', { name: /Buscar|Consultar|Orientación/ })).toHaveLength(7);
    await user.click(
      screen.getByRole('button', { name: /Buscar especialidad/i }),
    );

    expect(
      screen.getByText('¿Qué centros tienen cardiología?'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Centro Médico Horizonte')).toBeInTheDocument();
  });

  it('4. permite enviar manualmente un mensaje', async () => {
    renderAssistant();
    await sendMessage('Necesito información general');

    expect(screen.getByText('Necesito información general')).toBeInTheDocument();
    expect(
      await screen.findByText(/Los datos mostrados en este modo son simulados/i),
    ).toBeInTheDocument();
  });

  it('5. envía el mensaje mediante Enter', async () => {
    const { user } = renderAssistant();
    const composer = screen.getByLabelText('Escribe tu mensaje');

    await user.type(composer, 'Consulta enviada con Enter{Enter}');

    expect(screen.getByText('Consulta enviada con Enter')).toBeInTheDocument();
    expect(
      await screen.findByText(/Puedo ayudarte con centros, especialidades/i),
    ).toBeInTheDocument();
  });

  it('6. conserva una nueva línea con Shift + Enter', async () => {
    const { user } = renderAssistant();
    const composer = screen.getByLabelText('Escribe tu mensaje');

    await user.type(composer, 'Primera línea');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(composer, 'Segunda línea');

    expect(composer).toHaveValue('Primera línea\nSegunda línea');
    expect(screen.queryByText('Primera línea')).not.toBeInTheDocument();
  });

  it('7. mantiene el botón de envío bloqueado con texto vacío', () => {
    renderAssistant();

    expect(
      screen.getByRole('button', { name: 'Enviar mensaje' }),
    ).toBeDisabled();
  });

  it('8. bloquea el envío y permite cancelar durante la carga', async () => {
    const { user } = renderAssistant();
    const composer = screen.getByLabelText('Escribe tu mensaje');
    await user.type(composer, 'Consulta en curso');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('9. renderiza especialidades sugeridas sin presentarlas como diagnóstico', async () => {
    renderAssistant();
    await sendMessage(
      'Tengo dolor persistente en la rodilla. ¿A qué especialidad debería acudir?',
    );

    expect(await screen.findByText('Traumatología')).toBeInTheDocument();
    expect(screen.getByText(/no es un diagnóstico/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Buscar centros' }),
    ).toBeInTheDocument();
  });

  it('10. renderiza tarjetas de centros médicos', async () => {
    renderAssistant();
    await sendMessage('¿Qué centros tienen cardiología?');

    expect(await screen.findByText('Centro Médico Horizonte')).toBeInTheDocument();
    expect(screen.getByText('Avenida Demostración 120')).toBeInTheDocument();
    expect(screen.getByText('No disponible')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /agendar/i }),
    ).not.toBeInTheDocument();
  });

  it('11. renderiza horarios y disponibilidad', async () => {
    renderAssistant();
    await sendMessage('¿Qué centros atienden los sábados?');

    expect(await screen.findByText('Sábado')).toBeInTheDocument();
    expect(screen.getByText('08:30 – 12:30')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
  });

  it('12. renderiza costos y advierte cuando son simulados', async () => {
    renderAssistant();
    await sendMessage('¿Cuánto cuesta una consulta de dermatología?');

    expect(await screen.findByText(/180\s*BOB/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Precio simulado; confirma el monto/i),
    ).toBeInTheDocument();
  });

  it('13. presenta una señal de alarma accesible y prioritaria', async () => {
    renderAssistant();
    await sendMessage('Tengo dolor de pecho y dificultad respiratoria severa');

    const heading = await screen.findByRole('heading', {
      name: 'Busca atención inmediata',
    });
    const alert = heading.closest('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(within(alert as HTMLElement).getByText(/no confirma un diagnóstico/i)).toBeInTheDocument();
    expect(
      within(alert as HTMLElement).getByRole('button', {
        name: 'Buscar centros de emergencia',
      }),
    ).toBeInTheDocument();
  });

  it('14. muestra fuentes sin información técnica de Azure', async () => {
    const { user } = renderAssistant();
    await sendMessage('¿Dónde puedo realizarme un análisis de glucosa?');

    const summary = await screen.findByText('Fuentes de información');
    await user.click(summary);
    expect(
      screen.getByText('Directorio demostrativo de servicios Utamedic'),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(/Azure|Agent ID/i);
  });

  it('15. maneja una respuesta sin resultados', async () => {
    renderAssistant();
    await sendMessage('Buscar centro sin resultados');

    expect(
      await screen.findByText('No encontramos resultados'),
    ).toBeInTheDocument();
  });

  it('16. muestra un error general con reintento manual', async () => {
    renderAssistant();
    await sendMessage('simular error');

    expect(await screen.findByText('No pudimos responder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
  });

  it('17. distingue el estado de agente no disponible', async () => {
    renderAssistant();
    await sendMessage('agente no disponible');

    expect(
      await screen.findByText('Agente no disponible'),
    ).toBeInTheDocument();
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });

  it('18. inicia una nueva conversación y limpia los mensajes', async () => {
    const { user } = renderAssistant();
    await sendMessage('Mensaje que debe limpiarse');
    await screen.findByText(/Los datos mostrados en este modo son simulados/i);

    await user.click(
      screen.getByRole('button', { name: 'Nueva conversación' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Mensaje que debe limpiarse'),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText(/Hola, soy el Asistente Utamedic/i),
    ).toBeInTheDocument();
  });

  it('19. no expone Agent ID ni credenciales en el DOM', () => {
    renderAssistant();

    expect(document.body).not.toHaveTextContent(
      /Agent ID|Azure key|Client secret|Tenant ID|Connection string/i,
    );
  });

  it('20. no utiliza localStorage para la conversación', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderAssistant();
    await sendMessage('Consulta sin persistencia local');
    await screen.findByText(/Los datos mostrados en este modo son simulados/i);

    expect(storageSpy).not.toHaveBeenCalled();
  });
});
