import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Incident, Evidence, INCIDENT_STATUS_LABELS, INCIDENT_TYPE_LABELS } from '@watcher/shared';
import { incidentApi } from '../api/incidents';

function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadIncident(id);
  }, [id]);

  const loadIncident = async (incidentId: string) => {
    try {
      const [inc, evd] = await Promise.all([
        incidentApi.getById(incidentId),
        incidentApi.listEvidence(incidentId),
      ]);
      setIncident(inc);
      setEvidence(evd.evidence);
    } catch (err) {
      console.error('Failed to load incident:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEvidence = async (evidenceItem: Evidence) => {
    try {
      const result = await incidentApi.getEvidenceUrl(incident!.id, evidenceItem.id);
      window.open(result.presignedUrl, '_blank');
    } catch (err) {
      console.error('Failed to get evidence URL:', err);
    }
  };

  if (isLoading) {
    return <div className="loading" data-testid="incident-detail-loading">Loading...</div>;
  }

  if (!incident) {
    return <div className="error-state" data-testid="incident-detail-not-found">Incident not found.</div>;
  }

  return (
    <div className="incident-detail-page" data-testid="incident-detail-page">
      <button onClick={() => navigate(-1)} className="btn-back" data-testid="incident-detail-back">
        ← Back
      </button>

      <div className="incident-header">
        <h1 data-testid="incident-detail-title">Incident Details</h1>
        <span className={`status-badge status-${incident.status}`} data-testid="incident-detail-status">
          {INCIDENT_STATUS_LABELS[incident.status]}
        </span>
      </div>

      <div className="incident-meta" data-testid="incident-detail-meta">
        <div className="meta-item">
          <strong>Date:</strong> {new Date(incident.timestamp).toLocaleString()}
        </div>
        <div className="meta-item">
          <strong>Location:</strong> {incident.storeLocation}
        </div>
        <div className="meta-item">
          <strong>Type:</strong> {INCIDENT_TYPE_LABELS[incident.incidentType]}
        </div>
        <div className="meta-item">
          <strong>Created:</strong> {new Date(incident.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="incident-section">
        <h2>Suspect Details</h2>
        <p data-testid="incident-detail-suspect">{incident.suspectDetails}</p>
      </div>

      <div className="incident-section">
        <h2>Description</h2>
        <p data-testid="incident-detail-description">{incident.description}</p>
      </div>

      <div className="incident-section">
        <h2>Evidence ({evidence.length})</h2>
        {evidence.length === 0 ? (
          <p className="empty-state">No evidence attached.</p>
        ) : (
          <ul className="evidence-list" data-testid="incident-detail-evidence-list">
            {evidence.map((item) => (
              <li key={item.id} className="evidence-item">
                <span className="evidence-name">{item.fileName}</span>
                <span className="evidence-size">({(item.fileSize / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={() => handleViewEvidence(item)}
                  className="btn-link"
                  data-testid={`evidence-view-${item.id}`}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default IncidentDetailPage;
