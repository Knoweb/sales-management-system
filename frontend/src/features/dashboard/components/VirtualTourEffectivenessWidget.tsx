import React, { useEffect, useState } from 'react';
import { VirtualTourApi } from '../../../services/VirtualTourApi';
import { Card } from '../../../components/Card';
import { MonitorPlay, TrendingUp } from 'lucide-react';

export const VirtualTourEffectivenessWidget: React.FC = () => {
  const [analytics, setAnalytics] = useState<{completedTours: number, averageProbabilityIncrease: number}>({ completedTours: 0, averageProbabilityIncrease: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await VirtualTourApi.getEffectivenessAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch virtual tour analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <Card 
      className="card-primary" 
      style={{ 
        padding: '24px', 
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #f8fafc 100%)',
        borderLeft: '4px solid var(--color-primary)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="text-section-title" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MonitorPlay size={20} style={{ color: 'var(--color-primary)' }} />
            Virtual Tour Effectiveness
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            Completed virtual tours in the last 30 days
          </p>
        </div>
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#eff6ff', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TrendingUp size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          Calculating metrics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ 
              fontSize: '48px', 
              fontWeight: 800, 
              color: 'var(--color-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}>
              {analytics.completedTours}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>Successful Tours</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>Tracked this month</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
             <TrendingUp size={18} style={{ color: '#16a34a' }} />
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Average Conversion Lift</span>
                <span style={{ fontSize: '12px', color: '#15803d' }}>+{analytics.averageProbabilityIncrease.toFixed(1)}% sales probability after tours</span>
             </div>
          </div>
        </div>
      )}
    </Card>
  );
};
