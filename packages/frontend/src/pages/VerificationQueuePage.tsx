import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationRecord, VerificationStatus } from '@watcher/shared';
import { verificationApi } from '../api/verification';

function VerificationQueuePage() {
  const [items, setItems] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const response = await verificationApi.getQueue();
      setItems(response.items);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.AI_VALIDATED: return 'Awaiting Review';
      case VerificationStatus.IN_REVIEW: return 'In Review';
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="loading" data-testid="queue-loading">Loading...</div>;
  }

  return (
    <div className="verification-queue-page" data-testid="verification-queue-page">
      <div className="page-header">
        <h1>Verification Queue</h1>
        <span className="queue-count" data-testid="queue-count">{items.length} pending</span>
        <button onClick={loadQueue} className="btn-secondary" data-testid="queue-refresh-button">
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <p className="empty-state" data-testid="queue-empty">No incidents awaiting review.</p>
      ) : (
        <table className="incidents-table" data-testid="queue-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Tenant</th>
              <th>AI Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/verification/${item.id}`)}
                className="clickable-row"
                data-testid={`queue-item-${item.id}`}
              >
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.tenantId.includes('0001') ? 'Store 1' : 'Store 2'}</td>
                <td>
                  {item.aiValidation && (
                    <span className={`ai-score ${item.aiValidation.confidenceScore >= 0.9 ? 'high' : item.aiValidation.confidenceScore >= 0.8 ? 'medium' : 'low'}`}>
                      {(item.aiValidation.confidenceScore * 100).toFixed(0)}%
                    </span>
                  )}
                </td>
                <td><span className={`status-badge status-${item.status}`}>{getStatusLabel(item.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VerificationQueuePage;
