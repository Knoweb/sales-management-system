import React, { useEffect, useState } from 'react';
import { VirtualTourApi, type VirtualTour } from '../../../services/VirtualTourApi';
import { Card } from '../../../components/Card';
import { CalendarClock, Video, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UpcomingVirtualToursWidget: React.FC = () => {
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await VirtualTourApi.getUpcomingTours();
        setTours(data);
      } catch (error) {
        console.error('Failed to fetch upcoming virtual tours', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleTourClick = (tour: VirtualTour) => {
    if (tour.targetType === 'LEAD' && tour.leadId) {
      navigate(`/leads/${tour.leadId}`);
    } else if (tour.targetType === 'OPPORTUNITY' && tour.opportunityId) {
      navigate(`/opportunities/${tour.opportunityId}`);
    }
  };

  return (
    <Card 
      className="card-secondary" 
      style={{ 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        minHeight: '300px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 className="text-section-title" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} style={{ color: 'var(--color-primary)' }} />
            Upcoming Virtual Tours
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Scheduled tours that need your attention
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          Loading upcoming tours...
        </div>
      ) : tours.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', gap: '12px' }}>
            <Video size={32} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: '14px' }}>No upcoming tours scheduled.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {tours.map(tour => {
            const date = new Date(tour.tourDate);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={tour.id} 
                onClick={() => handleTourClick(tour)}
                style={{ 
                  padding: '16px', 
                  backgroundColor: 'var(--color-background)', 
                  borderRadius: '8px',
                  border: isToday ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isToday && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--color-primary)' }} />
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '15px' }}>
                            {tour.targetName || 'Unknown Client'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500, marginTop: '2px' }}>
                            {tour.targetType === 'OPPORTUNITY' ? 'Opportunity' : 'Lead'}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {isToday ? 'Today' : date.toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        <Video size={14} />
                        {tour.platform} {tour.language ? `(${tour.language})` : ''}
                    </div>
                    {tour.conductedByName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            <User size={14} />
                            {tour.conductedByName}
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
