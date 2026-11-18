import api from "./api/axios";
import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/health');
      setHealth(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '20px', direction: 'ltr' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>School HR Multi-Tenant System</h1>
      <p style={{ color: '#64748b' }}>Live Infrastructure & Connection Status</p>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', marginTop: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading && <p>Checking connection...</p>}

        {error && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <strong>Connection Failed:</strong> {error}
          </div>
        )}

        {health && (
          <div style={{ color: '#15803d', background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0', lineHeight: '1.8' }}>
            <p><strong>API Status:</strong> {health.message}</p>
            <p><strong>Database:</strong> {health.database}</p>
            <p><strong>Environment:</strong> {health.environment}</p>
            <p><strong>Server Time:</strong> {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        )}

        <button
          onClick={checkSystemHealth}
          style={{
            marginTop: '18px',
            padding: '10px 18px',
            cursor: 'pointer',
            backgroundColor: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          }}
        >
          Re-test Connection
        </button>
      </div>
    </div>
  );
}

export default App;
