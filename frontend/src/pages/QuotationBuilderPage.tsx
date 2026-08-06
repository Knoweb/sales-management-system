import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { FilePlus } from 'lucide-react';
import { 
  createQuotation, 
  type QuotationDto,
  type QuotationItemDto
} from '../services/QuotationApi';
import { getApprovedEstimateSummary, type ApprovedTechnicalEstimateSummaryDTO } from '../services/TechnicalCostingApi';

export const QuotationBuilderPage: React.FC = () => {
  const { technicalProjectId } = useParams<{ technicalProjectId: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<ApprovedTechnicalEstimateSummaryDTO | null>(null);
  
  const [quotation, setQuotation] = useState<Partial<QuotationDto>>({
    clientDetails: 'Default Client Details', // In a real app, you'd fetch this from the client module
    projectTitle: '',
    projectDescription: '',
    scopeOfWork: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    finalTotal: 0,
    paymentTerms: '50% advance, 50% on completion',
    deliveryPeriod: '',
    warrantyInformation: '1 year standard warranty',
    validityPeriod: '30 days',
    termsAndConditions: 'Standard terms apply.',
    items: [],
    status: 'DRAFT'
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (technicalProjectId) {
      loadEstimate(technicalProjectId);
    }
  }, [technicalProjectId]);

  const loadEstimate = async (id: string) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getApprovedEstimateSummary(id);
      setEstimate(data);
      
      const items: QuotationItemDto[] = [];
      let itemsTotal = 0;
      if (data.categoryBreakdown) {
        Object.entries(data.categoryBreakdown).forEach(([category, amount]) => {
          if (amount > 0) {
            items.push({
              description: `Category: ${category}`,
              quantity: 1,
              unitPrice: amount,
              lineTotal: amount
            });
            itemsTotal += amount;
          }
        });
      }

      const markup = (data.marginAmount || 0) + (data.contingencyAmount || 0);
      if (markup > 0) {
        items.push({
          description: `Professional Services & Overhead`,
          quantity: 1,
          unitPrice: markup,
          lineTotal: markup
        });
        itemsTotal += markup;
      }

      // Try to fetch the client name from the project summary (which we can get from the paginated list)
      let clientDetails = '';
      try {
        const { getTechnicalProjects } = await import('../services/TechnicalProjectApi');
        const projectsData = await getTechnicalProjects(0, 100);
        const proj = projectsData.content.find(p => p.id === id);
        if (proj) {
          clientDetails = proj.clientName || 'Client Name Unavailable';
        }
      } catch (e) {
        console.warn('Could not fetch project details for client name', e);
      }

      setQuotation(prev => ({
        ...prev,
        clientDetails,
        projectTitle: data.projectTitle || `${data.projectCode} Implementation`,
        approvedEstimateId: data.id,
        items,
        subtotal: itemsTotal,
        taxAmount: data.taxAmount || 0,
        finalTotal: data.finalTotal || 0,
        deliveryPeriod: data.totalDurationDays ? `${data.totalDurationDays} Days` : ''
      }));
    } catch (error: any) {
      console.error("Failed to load estimate", error);
      setErrorMsg(error?.response?.data?.message || 'Failed to load approved estimate. Make sure this project has an approved technical estimate.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const saved = await createQuotation(quotation as QuotationDto);
      navigate(`/quotations`); // Go back to list page for now
    } catch (error) {
      console.error("Failed to save quotation", error);
      alert('Failed to save quotation');
    }
  };

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading estimate details...</div>;
  if (errorMsg) return <div className="page-container" style={{ padding: '2rem', color: 'red' }}>{errorMsg}</div>;
  if (!estimate) return <div className="page-container" style={{ padding: '2rem' }}>Estimate not found.</div>;

  return (
    <div className="page-container">
      <PageHeader 
        title="Quotation Builder" 
        description="Draft a formal quotation based on the approved technical estimate."
        icon={<FilePlus size={24} className="text-blue-500" />}
      />

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Approved Estimate Summary</h2>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
          <div><span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Project Code:</span> {estimate.projectCode}</div>
          <div><span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Total Duration:</span> {estimate.totalDurationDays} Days</div>
          <div><span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Total Estimated Cost:</span> ${estimate.finalTotal?.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Quotation Details</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           
           <div className="form-group">
             <label className="form-label">Client Details</label>
             <input type="text" className="form-input" 
               value={quotation.clientDetails} onChange={e => setQuotation({...quotation, clientDetails: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Project Title</label>
             <input type="text" className="form-input" 
               value={quotation.projectTitle} onChange={e => setQuotation({...quotation, projectTitle: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Project Description</label>
             <textarea className="form-input" rows={2}
               value={quotation.projectDescription} onChange={e => setQuotation({...quotation, projectDescription: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Scope of Work</label>
             <textarea className="form-input" rows={4}
               value={quotation.scopeOfWork} onChange={e => setQuotation({...quotation, scopeOfWork: e.target.value})} />
           </div>
           
           <div className="table-wrapper">
             <table className="data-table">
               <thead>
                 <tr>
                   <th>Description</th>
                   <th>Qty</th>
                   <th>Unit Price</th>
                   <th>Total</th>
                 </tr>
               </thead>
               <tbody>
                 {quotation.items?.map((item, idx) => (
                   <tr key={idx}>
                     <td>{item.description}</td>
                     <td>{item.quantity}</td>
                     <td>${item.unitPrice.toFixed(2)}</td>
                     <td>${item.lineTotal.toFixed(2)}</td>
                   </tr>
                 ))}
                 {!quotation.items?.length && (
                   <tr>
                     <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>No items found in estimate.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Delivery Period</label>
                <input type="text" className="form-input" 
                  value={quotation.deliveryPeriod} onChange={e => setQuotation({...quotation, deliveryPeriod: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Warranty Information</label>
                <input type="text" className="form-input" 
                  value={quotation.warrantyInformation} onChange={e => setQuotation({...quotation, warrantyInformation: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Validity Period</label>
                <input type="text" className="form-input" 
                  value={quotation.validityPeriod} onChange={e => setQuotation({...quotation, validityPeriod: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Amount ($)</label>
                <input type="number" className="form-input" min="0" step="0.01"
                  value={quotation.discountAmount || ''} 
                  onChange={e => {
                    const discount = parseFloat(e.target.value) || 0;
                    const finalTotal = (quotation.subtotal || 0) + (quotation.taxAmount || 0) - discount;
                    setQuotation({...quotation, discountAmount: discount, finalTotal});
                  }} 
                />
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '1rem', marginTop: '1rem', gap: '0.5rem' }}>
              <div><span style={{ fontWeight: 500, marginRight: '1rem' }}>Subtotal:</span> ${quotation.subtotal?.toFixed(2)}</div>
              {estimate.contingencyAmount > 0 && (
                <div><span style={{ fontWeight: 500, marginRight: '1rem' }}>Contingency:</span> ${estimate.contingencyAmount.toFixed(2)}</div>
              )}
              {estimate.marginAmount > 0 && (
                <div><span style={{ fontWeight: 500, marginRight: '1rem' }}>Margin:</span> ${estimate.marginAmount.toFixed(2)}</div>
              )}
              <div><span style={{ fontWeight: 500, marginRight: '1rem' }}>Tax:</span> ${quotation.taxAmount?.toFixed(2)}</div>
              {quotation.discountAmount ? (
                <div style={{ color: '#ef4444' }}><span style={{ fontWeight: 500, marginRight: '1rem' }}>Discount:</span> -${quotation.discountAmount?.toFixed(2)}</div>
              ) : null}
              <div style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 600, marginRight: '1rem' }}>Final Total:</span>
                <span style={{ fontWeight: 600 }}>${quotation.finalTotal?.toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={() => navigate('/quotations')} className="btn btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn btn-primary">Generate Quotation</button>
      </div>
    </div>
  );
};
