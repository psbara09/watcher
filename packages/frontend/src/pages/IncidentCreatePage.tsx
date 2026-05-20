import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentType, INCIDENT_TYPE_LABELS, ALLOWED_EVIDENCE_TYPES, MAX_EVIDENCE_FILE_SIZE } from '@watcher/shared';
import { incidentApi } from '../api/incidents';

function IncidentCreatePage() {
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.THEFT);
  const [suspectDetails, setSuspectDetails] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    for (const file of selectedFiles) {
      if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
        setError(`File "${file.name}" has unsupported type. Allowed: JPEG, PNG, GIF, MP4, MPEG`);
        return;
      }
      if (file.size > MAX_EVIDENCE_FILE_SIZE) {
        setError(`File "${file.name}" exceeds 50MB limit.`);
        return;
      }
    }

    setError(null);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create incident
      const incident = await incidentApi.create({
        timestamp: new Date(timestamp).toISOString(),
        incidentType,
        suspectDetails,
        description,
      });

      // Upload evidence files
      for (const file of files) {
        await incidentApi.uploadEvidence(incident.id, file);
      }

      navigate(`/incidents/${incident.id}`);
    } catch (err) {
      console.error('Failed to create incident:', err);
      setError('Failed to submit incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="incident-create-page" data-testid="incident-create-page">
      <h1>New Incident</h1>

      <form onSubmit={handleSubmit} className="incident-form" data-testid="incident-create-form">
        {error && <div className="error-message" data-testid="incident-create-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="timestamp">When did this happen?</label>
          <input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
            disabled={isSubmitting}
            data-testid="incident-create-timestamp"
          />
        </div>

        <div className="form-group">
          <label htmlFor="incidentType">Incident Type</label>
          <select
            id="incidentType"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value as IncidentType)}
            required
            disabled={isSubmitting}
            data-testid="incident-create-type"
          >
            {Object.values(IncidentType).map((type) => (
              <option key={type} value={type}>{INCIDENT_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="suspectDetails">Suspect Details</label>
          <textarea
            id="suspectDetails"
            value={suspectDetails}
            onChange={(e) => setSuspectDetails(e.target.value)}
            placeholder="Describe the suspect (appearance, clothing, distinguishing features)"
            required
            disabled={isSubmitting}
            rows={3}
            data-testid="incident-create-suspect"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Incident Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened in detail"
            required
            disabled={isSubmitting}
            rows={5}
            data-testid="incident-create-description"
          />
        </div>

        <div className="form-group">
          <label>Evidence Files</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept={ALLOWED_EVIDENCE_TYPES.join(',')}
            multiple
            disabled={isSubmitting}
            data-testid="incident-create-file-input"
          />
          {files.length > 0 && (
            <ul className="file-list" data-testid="incident-create-file-list">
              {files.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  <button type="button" onClick={() => removeFile(index)} className="btn-remove" data-testid={`remove-file-${index}`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="btn-secondary"
            disabled={isSubmitting}
            data-testid="incident-create-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            data-testid="incident-create-submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Incident'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IncidentCreatePage;
