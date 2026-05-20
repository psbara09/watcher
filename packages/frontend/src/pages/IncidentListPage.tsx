import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, IncidentStatus, INCIDENT_STATUS_LABELS, INCIDENT_TYPE_LABELS } from '@watcher/shared';
import { incidentApi } from '../api/incidents';

function IncidentListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await incidentApi.list(statusFilter || undefined);
      setIncidents(response.incidents);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="incident-list-page" data-testid="incident-list-page">
      <div className="page-header">
        <h1>Incidents</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/incidents/new')}
          data-testid="incident-list-new-button"
        >
          + New Incident
        </button>
      </div>

      <div className="filters" data-testid="incident-list-filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          data-testid="incident-list-status-filter"
        >
          <option value="">All Statuses</option>
          {Object.values(IncidentStatus).map((status) => (
            <option key={status} value={status}>{INCIDENT_STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : incidents.length === 0 ? (
        <p className="empty-state" data-testid="incident-list-empty">No incidents found.</p>
      ) : (
        <table className="incidents-table" data-testid="incident-list-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Suspect</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="clickable-row"
                data-testid={`incident-row-${incident.id}`}
              >
                <td>{new Date(incident.timestamp).toLocaleDateString()}</td>
                <td>{INCIDENT_TYPE_LABELS[incident.incidentType]}</td>
                <td><span className={`status-badge status-${incident.status}`}>{INCIDENT_STATUS_LABELS[incident.status]}</span></td>
                <td className="description-cell">{incident.suspectDetails.substring(0, 40)}</td>
                <td className="description-cell">{incident.description.substring(0, 50)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IncidentListPage;
