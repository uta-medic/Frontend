import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
}
