import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { selectUser, selectTenant, selectRole, logout } from '../store/authSlice';
import { UserRole } from '@watcher/shared';

function AppShell() {
  const user = useAppSelector(selectUser);
  const tenant = useAppSelector(selectTenant);
  const role = useAppSelector(selectRole);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isStaff = role === UserRole.STORE_STAFF;
  const isAnalyst = role === UserRole.FACEWATCH_ANALYST;

  return (
    <div className="app-shell" data-testid="app-shell">
      <aside className="sidebar" data-testid="sidebar">
        <div className="sidebar-header">
          <h2>Watcher</h2>
        </div>

        <nav className="sidebar-nav">
          {isStaff && (
            <>
              <NavLink to="/dashboard" className="nav-link" data-testid="nav-dashboard">
                Dashboard
              </NavLink>
              <NavLink to="/incidents" className="nav-link" data-testid="nav-incidents">
                Incidents
              </NavLink>
              <NavLink to="/incidents/new" className="nav-link" data-testid="nav-new-incident">
                New Incident
              </NavLink>
            </>
          )}

          {isAnalyst && (
            <NavLink to="/verification" className="nav-link" data-testid="nav-verification">
              Verification Queue
            </NavLink>
          )}

          <hr className="nav-divider" />

          <NavLink to="/alerts" className="nav-link nav-placeholder" data-testid="nav-alerts">
            Alerts
          </NavLink>
          <NavLink to="/reports" className="nav-link nav-placeholder" data-testid="nav-reports">
            Reports
          </NavLink>
          {isAnalyst && (
            <>
              <NavLink to="/detection" className="nav-link nav-placeholder" data-testid="nav-detection">
                Detection
              </NavLink>
              <NavLink to="/admin" className="nav-link nav-placeholder" data-testid="nav-admin">
                Admin
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-bar" data-testid="top-bar">
          <div className="user-info">
            <span data-testid="user-display-name">{user?.username}</span>
            {tenant && <span className="tenant-badge" data-testid="tenant-badge">{tenant.name}</span>}
            {isAnalyst && <span className="role-badge" data-testid="role-badge">Analyst</span>}
          </div>
          <button
            onClick={handleLogout}
            className="btn-logout"
            data-testid="logout-button"
          >
            Logout
          </button>
        </header>

        <main className="page-content" data-testid="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
