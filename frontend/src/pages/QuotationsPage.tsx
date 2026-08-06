import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { FileText, Plus, X } from 'lucide-react';
import { getQuotations, type QuotationDto } from '../services/QuotationApi';
import { getTechnicalProjects, type TechnicalProjectSummaryDTO } from '../services/TechnicalProjectApi';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationDto[]>([]);
  const [projects, setProjects] = useState<TechnicalProjectSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    fetchQuotations();
    fetchProjects();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      // Fetch projects and only show those that are TEAM_READY (which means they have approved estimates)
      const response = await getTechnicalProjects(0, 100);
      setProjects(response.content.filter(p => p.status === 'TEAM_READY'));
    } catch (error) {
      console.error('Failed to fetch technical projects:', error);
    }
  };

  const handleCreateQuotation = () => {
    if (projectId.trim()) {
      navigate(`/technical-projects/${projectId.trim()}/quotation/new`);
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Quotations" 
        description="View and manage client quotations."
        icon={<FileText size={24} className="text-blue-500" />}
        actionElement={
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            Create Quotation
          </button>
        }
      />
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Quotation</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Technical Project (Must have an approved estimate)</label>
                <select 
                  className="form-control" 
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectCode} - {p.projectTitle}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateQuotation} disabled={!projectId.trim()}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Project</th>
                <th>Client</th>
                <th>Final Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading quotations...</td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotations.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500 }}>{q.quotationNumber}</td>
                    <td>{q.projectTitle || 'Untitled Project'}</td>
                    <td>{q.clientDetails}</td>
                    <td>${q.finalTotal?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${q.status === 'DRAFT' ? 'badge-gray' : 'badge-blue'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => navigate(`/quotations/${q.id}`)}
                        className="btn btn-ghost btn-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
