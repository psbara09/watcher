import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Incident, Evidence, ReviewDecision, VerificationHistory, INCIDENT_TYPE_LABELS, INCIDENT_STATUS_LABELS } from '@watcher/shared';
import { verificationApi, VerificationDetailResponse } from '../api/verification';
import { incidentApi } from '../api/incidents';

function VerificationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [verification, setVerification] = useState<VerificationDetailResponse | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (verificationId: string) => {
    try {
      const ver = await verificationApi.getById(verificationId);
      setVerification(ver);

      const [inc, evd] = await Promise.all([
        incidentApi.getById(ver.incidentId),
        incidentApi.listEvidence(ver.incidentId),
      ]);
      setIncident(inc);
      setEvidence(evd.evidence);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (decision: ReviewDecision) => {
    if (!id) return;

    const confirmMsg = decision === ReviewDecision.APPROVED
      ? 'Are you sure you want to APPROVE this incident?'
      : 'Are you sure you want to REJECT this incident?';

    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      await verificationApi.submitReview(id, { decision, notes });
      navigate('/verification');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEvidence = async (item: Evidence) => {
    try {
      const result = await incidentApi.getEvidenceUrl(incident!.id, item.id);
      window.open(result.presignedUrl, '_blank');
    } catch (err) {
      console.error('Failed to get evidence URL:', err);
    }
  };

  if (isLoading) {
    return <div className="loading" data-testid="review-loading">Loading...</div>;
  }

  if (!verification || !incident) {
    return <div className="error-state" data-testid="review-not-found">Record not found.</div>;
  }

  const isDecided = verification.analystReview !== null;

  return (
    <div className="verification-review-page" data-testid="verification-review-page">
      <button onClick={() => navigate('/verification')} className="btn-back" data-testid="review-back">
        ← Back to Queue
      </button>

      <h1>Review Incident</h1>

      {/* AI Validation Info */}
      <div className="review-section ai-section" data-testid="review-ai-section">
        <h2>AI Validation</h2>
        {verification.aiValidation && (
          <div className="ai-results">
            <span className="ai-label">Confidence Score:</span>
            <span className={`ai-score ${verification.aiValidation.confidenceScore >= 0.9 ? 'high' : 'medium'}`} data-testid="review-ai-score">
              {(verification.aiValidation.confidenceScore * 100).toFixed(0)}%
            </span>
            <span className="ai-label">Validated:</span>
            <span>{new Date(verification.aiValidation.validatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Incident Details */}
      <div className="review-section" data-testid="review-incident-section">
        <h2>Incident Details</h2>
        <div className="incident-meta">
          <div className="meta-item"><strong>Date:</strong> {new Date(incident.timestamp).toLocaleString()}</div>
          <div className="meta-item"><strong>Store:</strong> {incident.storeLocation}</div>
          <div className="meta-item"><strong>Type:</strong> {INCIDENT_TYPE_LABELS[incident.incidentType]}</div>
          <div className="meta-item"><strong>Status:</strong> {INCIDENT_STATUS_LABELS[incident.status]}</div>
        </div>
        <div className="incident-section">
          <h3>Suspect Details</h3>
          <p data-testid="review-suspect">{incident.suspectDetails}</p>
        </div>
        <div className="incident-section">
          <h3>Description</h3>
          <p data-testid="review-description">{incident.description}</p>
        </div>
      </div>

      {/* Evidence */}
      <div className="review-section" data-testid="review-evidence-section">
        <h2>Evidence ({evidence.length})</h2>
        {evidence.length === 0 ? (
          <p>No evidence attached.</p>
        ) : (
          <ul className="evidence-list">
            {evidence.map((item) => (
              <li key={item.id} className="evidence-item">
                <span>{item.fileName}</span>
                <button onClick={() => handleViewEvidence(item)} className="btn-link" data-testid={`review-evidence-${item.id}`}>
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Verification History */}
      <div className="review-section" data-testid="review-history-section">
        <h2>History</h2>
        <ul className="history-timeline">
          {verification.history?.map((entry: VerificationHistory) => (
            <li key={entry.id} className="history-entry">
              <span className="history-time">{new Date(entry.createdAt).toLocaleString()}</span>
              <span className="history-action">{entry.action}</span>
              <span className="history-actor">by {entry.actor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Decision Panel */}
      {!isDecided && (
        <div className="decision-panel" data-testid="review-decision-panel">
          <h2>Your Decision</h2>
          <div className="form-group">
            <label htmlFor="notes">Review Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your decision..."
              rows={3}
              disabled={isSubmitting}
              data-testid="review-notes-input"
            />
          </div>
          <div className="decision-buttons">
            <button
              onClick={() => handleDecision(ReviewDecision.REJECTED)}
              className="btn-reject"
              disabled={isSubmitting}
              data-testid="review-reject-button"
            >
              {isSubmitting ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={() => handleDecision(ReviewDecision.APPROVED)}
              className="btn-approve"
              disabled={isSubmitting}
              data-testid="review-approve-button"
            >
              {isSubmitting ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      )}

      {isDecided && (
        <div className="decision-result" data-testid="review-decision-result">
          <h2>Decision: <span className={`decision-${verification.analystReview!.decision}`}>{verification.analystReview!.decision.toUpperCase()}</span></h2>
          {verification.analystReview!.notes && <p>Notes: {verification.analystReview!.notes}</p>}
          <p>Reviewed: {new Date(verification.analystReview!.reviewedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default VerificationReviewPage;
