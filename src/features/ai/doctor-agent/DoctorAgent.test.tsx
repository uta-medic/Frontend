import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../../app/App';
import { RoleProtectedRoute } from '../../../routes/RoleProtectedRoute';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderDoctor() {
  window.history.pushState({}, '', '/medico/copiloto');
  return { user: userEvent.setup(), ...render(<App />) };
}

async function sendDoctorMessage(message: string) {
  const user = userEvent.setup();
  const composer = screen.getByLabelText('Escribe tu mensaje');
  await user.type(composer, message);
  await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
}

async function generateDifferential() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Duración'), '3 semanas');
  await user.click(
    screen.getByRole('button', {
      name: 'Generar posibilidades para revisión',
    }),
  );
  return user;
}

describe('copiloto clínico para médicos', () => {
  it('1. renderiza /medico/copiloto', () => {
    renderDoctor();

    expect(
      screen.getByRole('heading', {
        name: 'Espacio de apoyo para revisión médica',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Modo demo de rol · Sin autenticación real'),
    ).toBeInTheDocument();
  });

  it('2. mantiene visible el aviso de responsabilidad médica', () => {
    renderDoctor();

    expect(
      screen.getByText('La IA organiza y sugiere; el médico verifica y decide.'),
    ).toBeInTheDocument();
  });

  it('3. mantiene preparada la protección de ruta por rol', () => {
    render(
      <MemoryRouter
        initialEntries={['/medico/copiloto']}
      >
        <Routes>
          <Route
            element={
              <RoleProtectedRoute
                requiredRole="doctor"
                authorization={{ isAuthenticated: false, roles: [] }}
              />
            }
          >
            <Route
              path="/medico/copiloto"
              element={<p>Contenido protegido</p>}
            />
          </Route>
          <Route path="/asistente" element={<p>Redirección segura</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Redirección segura')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('4. carga un paciente demo sin permitir introducir IDs libres', () => {
    renderDoctor();

    expect(
      screen.getByText('Datos ficticios de demostración'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Paciente Demo A' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Paciente demo autorizado para esta sesión'),
    ).toHaveValue('DEMO-CL-001');
    expect(screen.queryByRole('textbox', { name: /patient id/i })).not.toBeInTheDocument();
  });

  it('5. renderiza alergias documentadas con su fuente', () => {
    renderDoctor();

    expect(screen.getByRole('heading', { name: 'Alergias' })).toBeInTheDocument();
    expect(screen.getByText('Penicilina')).toBeInTheDocument();
    expect(screen.getByText('Urticaria generalizada documentada')).toBeInTheDocument();
  });

  it('6. renderiza medicamentos activos sin prescribir', () => {
    renderDoctor();

    expect(
      screen.getByRole('heading', { name: 'Medicamentos activos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Losartán')).toBeInTheDocument();
    expect(screen.getByText(/50 mg · Cada 24 horas/i)).toBeInTheDocument();
  });

  it('7. renderiza consultas recientes', () => {
    renderDoctor();

    expect(
      screen.getByRole('heading', { name: 'Consultas recientes' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Medicina interna · 2026-07-12/i)).toBeInTheDocument();
  });

  it('8. renderiza laboratorios recientes y pendientes', () => {
    renderDoctor();

    expect(screen.getByRole('heading', { name: 'Laboratorios recientes' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Hemoglobina' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'TSH' })).toBeInTheDocument();
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
  });

  it('9. renderiza signos vitales recientes', () => {
    renderDoctor();

    expect(
      screen.getByRole('heading', { name: 'Signos vitales recientes' }),
    ).toBeInTheDocument();
    expect(screen.getByText('108/68 mmHg')).toBeInTheDocument();
    expect(screen.getByText('97 %')).toBeInTheDocument();
  });

  it('10. genera un resumen clínico mediante el proveedor mock', async () => {
    const { user } = renderDoctor();
    await user.click(
      screen.getByRole('button', { name: 'Generar resumen clínico' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Resumen clínico organizado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/La información se organizó desde registros ficticios/i),
    ).toBeInTheDocument();
  });

  it('11. renderiza las fuentes clínicas utilizadas', () => {
    renderDoctor();

    expect(
      screen.getByRole('heading', { name: 'Fuentes utilizadas' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Hospital Universitario Ficticio Central').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ref. DEMO-HC-1001/i).length).toBeGreaterThan(0);
  });

  it('12. presenta contradicciones y solicita verificación profesional', () => {
    renderDoctor();

    expect(screen.getByRole('heading', { name: 'Contradicciones' })).toBeInTheDocument();
    expect(screen.getByText('Una vez al día')).toBeInTheDocument();
    expect(screen.getByText('Días alternos')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Se encontró información contradictoria que requiere verificación profesional.',
      ),
    ).toBeInTheDocument();
  });

  it('13. genera posibilidades diferenciales mediante un formulario clínico breve', async () => {
    renderDoctor();
    await generateDifferential();

    expect(
      await screen.findByRole('heading', { name: 'Posibilidades para considerar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Anemia ferropénica para considerar')).toBeInTheDocument();
    expect(screen.getByText('Alteración tiroidea para considerar')).toBeInTheDocument();
  });

  it('14. muestra la advertencia obligatoria de no diagnóstico', async () => {
    renderDoctor();
    await generateDifferential();

    expect(
      await screen.findByText(/No representan un diagnóstico y requieren anamnesis/i),
    ).toBeInTheDocument();
  });

  it('15. no presenta aprobación automática de diagnósticos', () => {
    renderDoctor();

    expect(
      screen.queryByRole('button', { name: /confirmar diagnóstico|aprobar sugerencia/i }),
    ).not.toBeInTheDocument();
  });

  it('16. no presenta prescripción, receta o alta automática', () => {
    renderDoctor();

    expect(
      screen.queryByRole('button', { name: /receta|prescribir|dar alta/i }),
    ).not.toBeInTheDocument();
  });

  it('17. cambiar de paciente limpia resultados y contexto anterior', async () => {
    const { user } = renderDoctor();
    await user.click(
      screen.getByRole('button', { name: 'Generar resumen clínico' }),
    );
    await screen.findByRole('heading', { name: 'Resumen clínico organizado' });

    await user.selectOptions(
      screen.getByLabelText('Paciente demo autorizado para esta sesión'),
      'DEMO-CL-002',
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Resumen clínico organizado' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: 'Paciente Demo B' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Penicilina')).not.toBeInTheDocument();
  });

  it('18. maneja una respuesta 403', async () => {
    renderDoctor();
    await sendDoctorMessage('simular 403');

    expect(await screen.findByText('Acceso no autorizado')).toBeInTheDocument();
  });

  it('19. maneja agente médico no disponible con estado 503', async () => {
    renderDoctor();
    await sendDoctorMessage('agente medico no disponible');

    expect(await screen.findByText('Agente no disponible')).toBeInTheDocument();
  });

  it('20. maneja timeout de forma diferenciada', async () => {
    renderDoctor();
    await sendDoctorMessage('simular timeout');

    expect(
      await screen.findByText('Tiempo de espera agotado'),
    ).toBeInTheDocument();
  });

  it('21. no expone Agent ID, prompts internos ni secretos en el DOM', () => {
    renderDoctor();

    expect(document.body).not.toHaveTextContent(
      /Agent ID|Azure key|Client secret|Tenant ID|Connection string|prompt interno/i,
    );
  });

  it('22. no persiste información clínica en localStorage o sessionStorage', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { user } = renderDoctor();
    await user.click(
      screen.getByRole('button', { name: 'Generar resumen clínico' }),
    );
    await screen.findByRole('heading', { name: 'Resumen clínico organizado' });

    expect(storageSpy).not.toHaveBeenCalled();
  });

  it('23. mantiene funcionando la ruta /asistente', () => {
    window.history.pushState({}, '', '/asistente');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Asistente Utamedic' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no reemplazo una evaluación médica/i),
    ).toBeInTheDocument();
  });
});
