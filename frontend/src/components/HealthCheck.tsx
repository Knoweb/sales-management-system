import { useState, useEffect } from 'react';
import { HealthApi, type HealthResponse } from '../services/Api';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await HealthApi.checkHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="health-check-card">
      <div className="health-check-header">
        <div className="title-group">
          <Activity className="icon-primary" />
          <h2>System Status</h2>
        </div>
        <button 
          onClick={fetchHealth} 
          className="refresh-btn" 
          disabled={loading}
          aria-label="Refresh status"
        >
          <RefreshCw className={`icon-small ${loading ? 'spin' : ''}`} />
        </button>
      </div>

      <div className="health-check-content">
        {loading ? (
          <div className="status-indicator loading">
            <RefreshCw className="spin icon-large" />
            <span>Checking connection...</span>
          </div>
        ) : error ? (
          <div className="status-indicator error">
            <XCircle className="icon-large" />
            <div className="error-details">
              <strong>Connection Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        ) : health ? (
          <div className="status-indicator success">
            <CheckCircle2 className="icon-large" />
            <div className="success-details">
              <strong>All Systems Operational</strong>
              <div className="metadata">
                <span className="badge">Status: {health.status}</span>
                <span className="badge">App: {health.application}</span>
                <span className="timestamp">Updated: {new Date(health.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
