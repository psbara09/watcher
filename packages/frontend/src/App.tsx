import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store';
import { selectIsAuthenticated, selectRole } from './store/authSlice';
import { UserRole } from '@watcher/shared';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentListPage from './pages/IncidentListPage';
import IncidentCreatePage from './pages/IncidentCreatePage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import VerificationQueuePage from './pages/VerificationQueuePage';
import VerificationReviewPage from './pages/VerificationReviewPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? (
          <Navigate to={role === UserRole.FACEWATCH_ANALYST ? '/verification' : '/dashboard'} replace />
        ) : (
          <LoginPage />
        )
      } />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* Store Staff routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentListPage />} />
        <Route path="/incidents/new" element={<IncidentCreatePage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />

        {/* Analyst routes */}
        <Route path="/verification" element={<VerificationQueuePage />} />
        <Route path="/verification/:id" element={<VerificationReviewPage />} />

        {/* Future feature placeholders */}
        <Route path="/alerts" element={<PlaceholderPage title="Alerts" message="This feature is coming soon." />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" message="This feature is coming soon." />} />
        <Route path="/detection" element={<PlaceholderPage title="Real-time Detection" message="This feature is coming soon." />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin" message="This feature is coming soon." />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
