/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { FileText, Download, Building2, Mail, Phone, Send, CheckCircle, AlertCircle, Clock, Edit } from 'lucide-react';
import { 
  getQuotationById, 
  getQuotationApprovalHistory,
  submitQuotationForApproval,
  processQuotationApproval,
  markQuotationAsSent,
  updateQuotationClientDecision,
  type QuotationDto,
  type QuotationApprovalHistoryDto,
  type QuotationApprovalDto
} from '../services/QuotationApi';
import { useAuth } from '../context/AuthContext';
import { QuotationApprovalModal } from '../components/QuotationApprovalModal';
import { ClientDecisionModal } from '../components/clients/ClientDecisionModal';

export const QuotationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quotation, setQuotation] = useState<QuotationDto | null>(null);
  const [history, setHistory] = useState<QuotationApprovalHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<QuotationApprovalDto['action'] | null>(null);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const isTopManagement = user?.roles.includes('TOP_MANAGEMENT') || user?.roles.includes('SYSTEM_ADMIN');

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (quotationId: string) => {
    try {
      setLoading(true);
      const data = await getQuotationById(quotationId);
      setQuotation(data);
      
      const historyData = await getQuotationApprovalHistory(quotationId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch quotation details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };
  
  const handleAction = (action: QuotationApprovalDto['action']) => {
    setModalAction(action);
    setIsModalOpen(true);
  };
  
  const handleModalSubmit = async (data: QuotationApprovalDto) => {
    try {
      setIsModalOpen(false);
      if (id) {
        await processQuotationApproval(id, data);
        await fetchData(id);
      }
    } catch (e) {
      console.error("Failed to process approval", e);
      alert("An error occurred while processing approval.");
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      if (id) {
        await submitQuotationForApproval(id);
        await fetchData(id);
      }
    } catch (e) {
      console.error("Failed to submit", e);
    }
  };
  
  const handleMarkAsSent = async () => {
    try {
      if (id) {
        await markQuotationAsSent(id);
        await fetchData(id);
      }
    } catch (e) {
      console.error("Failed to mark as sent", e);
    }
  };

  const handleClientDecision = async (decision: { action: string; comments?: string }) => {
    try {
      if (id) {
        await updateQuotationClientDecision(id, decision);
        setIsClientModalOpen(false);
        await fetchData(id);
      }
    } catch (e) {
      console.error("Failed to update client decision", e);
      alert("An error occurred while saving the client decision.");
    }
  };

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading quotation details...</div>;
  if (!quotation) return <div className="page-container" style={{ padding: '2rem' }}>Quotation not found.</div>;

  return (
    <div className="page-container print-container">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
            .invoice-card {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
          
          .invoice-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            max-width: 900px;
            margin: 0 auto;
            padding: 3rem;
            color: #333;
            font-family: 'Inter', system-ui, sans-serif;
            border-top: 6px solid #2563eb;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .company-details {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.6;
          }
          
          .company-details strong {
            color: #111827;
            font-size: 1.25rem;
            display: block;
            margin-bottom: 0.5rem;
          }

          .invoice-meta {
            text-align: right;
          }
          
          .invoice-meta h1 {
            font-size: 2.25rem;
            font-weight: 800;
            color: #2563eb;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.02em;
          }
          
          .invoice-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 3rem;
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
          }
          
          .details-section h3 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin: 0 0 0.75rem 0;
            font-weight: 700;
          }
          
          .details-section p {
            margin: 0;
            color: #0f172a;
            font-weight: 500;
            line-height: 1.5;
            white-space: pre-line;
          }
          
          .modern-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 2rem;
          }
          
          .modern-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .modern-table th:last-child, .modern-table td:last-child {
            text-align: right;
          }
          
          .modern-table td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
            font-size: 0.9375rem;
          }
          
          .modern-table tr:last-child td {
            border-bottom: none;
          }
          
          .totals-section {
            width: 100%;
            max-width: 350px;
            margin-left: auto;
            margin-bottom: 3rem;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            color: #475569;
            font-size: 0.9375rem;
          }
          
          .total-row.final {
            background: #2563eb;
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin-top: 0.5rem;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
          }
          
          .terms-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #f3f4f6;
          }
          
          .term-block h4 {
            font-size: 0.875rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.5rem 0;
          }
          
          .term-block p {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.6;
            margin: 0;
            white-space: pre-line;
          }
          
          .status-banner {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        `}
      </style>

      <div className="no-print">
        <PageHeader 
          title="Quotation Details" 
          description="View and manage quotation details."
          icon={<FileText size={24} className="text-blue-500" />}
          actionElement={
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/quotations')} className="btn btn-secondary">Back to Quotations</button>
              <button onClick={handleDownloadPdf} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} /> Download PDF
              </button>
            </div>
          }
        />
        
        {/* Action Banner Based on Status */}
        <div className="card no-print" style={{ marginBottom: '2rem' }}>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {quotation.status === 'DRAFT' || quotation.status === 'RETURNED_FOR_CORRECTION' ? <AlertCircle className="text-gray-500" /> :
               quotation.status === 'PENDING_TOP_MANAGEMENT_APPROVAL' ? <Clock className="text-orange-500" /> :
               quotation.status === 'APPROVED_BY_TOP_MANAGEMENT' ? <CheckCircle className="text-green-500" /> :
               quotation.status === 'CLIENT_ACCEPTED' ? <CheckCircle className="text-green-600" /> :
               <AlertCircle className="text-red-500" />}
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Status: {quotation.status?.replace(/_/g, ' ')}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  {quotation.status === 'DRAFT' && 'This quotation is in draft state. Submit for top management approval.'}
                  {quotation.status === 'PENDING_TOP_MANAGEMENT_APPROVAL' && 'Waiting for Top Management to review and approve.'}
                  {quotation.status === 'APPROVED_BY_TOP_MANAGEMENT' && 'Approved by top management. Ready to be sent to the client.'}
                  {quotation.status === 'PENDING_CLIENT_APPROVAL' && 'Sent to client. Waiting for their decision.'}
                  {quotation.status === 'CLIENT_ACCEPTED' && 'Client has accepted this quotation! The project is won.'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {/* Creator Actions */}
              {(quotation.status === 'DRAFT' || quotation.status === 'RETURNED_FOR_CORRECTION') && user?.permissions.includes('QUOTATION_CREATE') && !user?.roles.includes('SALES_OFFICER') && (
                <>
                  <button className="btn btn-secondary" onClick={() => navigate(`/quotations/${id}/edit`)}>
                    <Edit size={18} style={{ marginRight: '0.5rem' }}/> Edit Quotation
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmitForApproval}>
                    <Send size={18} style={{ marginRight: '0.5rem' }}/> Submit for Approval
                  </button>
                </>
              )}
              
              {/* Top Management Actions */}
              {isTopManagement && quotation.status === 'PENDING_TOP_MANAGEMENT_APPROVAL' && (
                <>
                  <button className="btn btn-secondary text-orange-600 border-orange-600 hover:bg-orange-50" onClick={() => handleAction('RETURN')}>Return for Correction</button>
                  <button className="btn btn-danger" onClick={() => handleAction('REJECT')}>Reject</button>
                  <button className="btn btn-primary bg-green-600 hover:bg-green-700" onClick={() => handleAction('APPROVE')}>
                    <CheckCircle size={18} style={{ marginRight: '0.5rem' }}/> Approve Quotation
                  </button>
                </>
              )}
              
              {/* Post-Approval Actions */}
              {quotation.status === 'APPROVED_BY_TOP_MANAGEMENT' && !user?.roles.includes('SALES_OFFICER') && (
                <button className="btn btn-primary" onClick={handleMarkAsSent}>
                  <Send size={18} style={{ marginRight: '0.5rem' }}/> Mark as Sent to Client
                </button>
              )}
              
              {quotation.status === 'PENDING_CLIENT_APPROVAL' && user?.permissions.includes('QUOTATION_CREATE') && (
                <button className="btn btn-primary bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsClientModalOpen(true)}>
                  <Edit size={18} style={{ marginRight: '0.5rem' }}/> Record Client Decision
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="invoice-card" id="printable-quotation">
        <div className="invoice-header">
          <div className="company-details">
            <strong>Knoweb Solutions</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Building2 size={14} /> 123 Tech Park, Colombo 03, Sri Lanka
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Mail size={14} /> hello@knoweb.lk
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Phone size={14} /> +94 11 234 5678
            </div>
          </div>
          
          <div className="invoice-meta">
            <h1>QUOTATION</h1>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
              Ref No: {quotation.quotationNumber}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Date: {new Date(quotation.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className={`badge ${quotation.status === 'DRAFT' ? 'badge-gray' : 'badge-blue'}`} style={{ marginTop: '0.75rem' }}>
              {quotation.status?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
        
        <div className="invoice-details-grid">
          <div className="details-section">
            <h3>Billed To</h3>
            <p>{quotation.clientDetails}</p>
          </div>
          <div className="details-section">
            <h3>Project Description</h3>
            <p style={{ fontWeight: 700, color: '#2563eb' }}>{quotation.projectTitle}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>{quotation.projectDescription}</p>
          </div>
        </div>
        
        {quotation.scopeOfWork && (
          <div className="details-section" style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
            <h3>Scope of Work</h3>
            <p>{quotation.scopeOfWork}</p>
          </div>
        )}

        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.description}</div>
                </td>
                <td>{item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
            {!quotation.items?.length && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No items in this quotation.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="totals-section">
          <div className="total-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>${quotation.subtotal?.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Estimated Tax (VAT)</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>${quotation.taxAmount?.toFixed(2)}</span>
          </div>
          {quotation.discountAmount > 0 && (
            <div className="total-row" style={{ color: '#ef4444' }}>
              <span>Discount</span>
              <span style={{ fontWeight: 600 }}>-${quotation.discountAmount?.toFixed(2)}</span>
            </div>
          )}
          <div className="total-row final">
            <span>Final Total</span>
            <span>${quotation.finalTotal?.toFixed(2)}</span>
          </div>
        </div>

        <div className="terms-grid">
          <div className="term-block">
            <h4>Terms & Conditions</h4>
            <p>{quotation.termsAndConditions || 'Standard terms apply.'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="term-block">
              <h4>Delivery Period</h4>
              <p>{quotation.deliveryPeriod || 'N/A'}</p>
            </div>
            <div className="term-block">
              <h4>Warranty Information</h4>
              <p>{quotation.warrantyInformation || 'N/A'}</p>
            </div>
            <div className="term-block">
              <h4>Payment Terms</h4>
              <p>{quotation.paymentTerms}</p>
            </div>
            <div className="term-block">
              <h4>Validity Period</h4>
              <p>{quotation.validityPeriod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approval History Section */}
      <div className="card no-print" style={{ maxWidth: '900px', margin: '2rem auto 0 auto' }}>
        <div className="card-header">
          <h2 className="card-title">Approval & Status History</h2>
        </div>
        <div className="card-body">
          {history.length === 0 ? (
            <p className="text-gray-500" style={{ textAlign: 'center', padding: '2rem 0' }}>No history records found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((record) => (
                <div key={record.id} style={{ 
                  padding: '1rem', 
                  borderLeft: `4px solid ${
                    record.action === 'APPROVE' ? '#16a34a' : 
                    record.action === 'REJECT' ? '#dc2626' : 
                    record.action === 'SUBMIT_FOR_APPROVAL' ? '#2563eb' : '#f97316'
                  }`,
                  backgroundColor: '#f8fafc',
                  borderRadius: '0 8px 8px 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{record.action.replace(/_/g, ' ')}</strong>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                    By: {record.createdByName}
                  </div>
                  {record.comments && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: 'white', 
                      borderRadius: '4px', 
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-line'
                    }}>
                      "{record.comments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <QuotationApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit} 
        action={modalAction} 
      />
      
      <ClientDecisionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSubmit={handleClientDecision}
      />
    </div>
  );
};
