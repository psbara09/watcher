import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, IncidentStatus, INCIDENT_STATUS_LABELS } from '@watcher/shared';
import { incidentApi } from '../api/incidents';
import { useAppSelector } from '../store';
import { selectTenant } from '../store/authSlice';

function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tenant = useAppSelector(selectTenant);
  const navigate = useNavigate();

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const response = await incidentApi.list();
      setIncidents(response.incidents);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const countByStatus = (status: IncidentStatus) =>
    incidents.filter((i) => i.status === status).length;

  if (isLoading) {
    return <div className="loading" data-testid="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <div className="page-header">
        <h1 data-testid="dashboard-title">{tenant?.name} Dashboard</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/incidents/new')}
          data-testid="dashboard-new-incident-button"
        >
          + New Incident
        </button>
      </div>

      <div className="stats-grid" data-testid="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value" data-testid="stat-total">{incidents.length}</div>
          <div className="stat-label">Total Incidents</div>
        </div>
        <div className="stat-card stat-submitted">
          <div className="stat-value" data-testid="stat-submitted">{countByStatus(IncidentStatus.SUBMITTED)}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card stat-review">
          <div className="stat-value" data-testid="stat-under-review">{countByStatus(IncidentStatus.UNDER_REVIEW)}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-value" data-testid="stat-approved">{countByStatus(IncidentStatus.APPROVED)}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-value" data-testid="stat-rejected">{countByStatus(IncidentStatus.REJECTED)}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="recent-incidents">
        <h2>Recent Incidents</h2>
        {incidents.length === 0 ? (
          <p className="empty-state" data-testid="dashboard-empty">No incidents yet. Create your first incident.</p>
        ) : (
          <table className="incidents-table" data-testid="dashboard-incidents-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 5).map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="clickable-row"
                  data-testid={`incident-row-${incident.id}`}
                >
                  <td>{new Date(incident.timestamp).toLocaleDateString()}</td>
                  <td>{incident.incidentType}</td>
                  <td><span className={`status-badge status-${incident.status}`}>{INCIDENT_STATUS_LABELS[incident.status]}</span></td>
                  <td className="description-cell">{incident.description.substring(0, 60)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
