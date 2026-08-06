/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { FileEdit } from 'lucide-react';
import { 
  getQuotationById,
  updateQuotation,
  type QuotationDto
} from '../services/QuotationApi';

export const QuotationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quotation, setQuotation] = useState<Partial<QuotationDto>>({
    clientDetails: '',
    projectTitle: '',
    projectDescription: '',
    scopeOfWork: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    finalTotal: 0,
    paymentTerms: '',
    deliveryPeriod: '',
    warrantyInformation: '',
    validityPeriod: '',
    termsAndConditions: '',
    items: [],
    status: 'DRAFT'
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) {
      loadQuotation(id);
    }
  }, [id]);

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getQuotationById(id);
      
      if (data.status !== 'DRAFT' && data.status !== 'RETURNED_FOR_CORRECTION') {
        setErrorMsg('Only Draft or Returned quotations can be edited.');
      } else {
        setQuotation(data);
      }
    } catch (error: any) {
      console.error("Failed to load quotation", error);
      setErrorMsg(error?.response?.data?.message || 'Failed to load quotation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateQuotation(id, quotation as QuotationDto);
      navigate(`/quotations/${id}`);
    } catch (error) {
      console.error("Failed to save quotation", error);
      alert('Failed to save quotation');
    }
  };

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading quotation details...</div>;
  if (errorMsg) return <div className="page-container" style={{ padding: '2rem', color: 'red' }}>{errorMsg}</div>;

  return (
    <div className="page-container">
      <PageHeader 
        title="Edit Quotation" 
        description="Update quotation details before submitting for approval."
        icon={<FileEdit size={24} className="text-blue-500" />}
      />
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Quotation Details</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           
           <div className="form-group">
             <label className="form-label">Client Details</label>
             <input type="text" className="form-input" 
               value={quotation.clientDetails || ''} onChange={e => setQuotation({...quotation, clientDetails: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Project Title</label>
             <input type="text" className="form-input" 
               value={quotation.projectTitle || ''} onChange={e => setQuotation({...quotation, projectTitle: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Project Description</label>
             <textarea className="form-input" rows={2}
               value={quotation.projectDescription || ''} onChange={e => setQuotation({...quotation, projectDescription: e.target.value})} />
           </div>

           <div className="form-group">
             <label className="form-label">Scope of Work</label>
             <textarea className="form-input" rows={4}
               value={quotation.scopeOfWork || ''} onChange={e => setQuotation({...quotation, scopeOfWork: e.target.value})} />
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
                  value={quotation.deliveryPeriod || ''} onChange={e => setQuotation({...quotation, deliveryPeriod: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Warranty Information</label>
                <input type="text" className="form-input" 
                  value={quotation.warrantyInformation || ''} onChange={e => setQuotation({...quotation, warrantyInformation: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Validity Period</label>
                <input type="text" className="form-input" 
                  value={quotation.validityPeriod || ''} onChange={e => setQuotation({...quotation, validityPeriod: e.target.value})} />
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
        <button onClick={() => navigate(`/quotations/${id}`)} className="btn btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
};
