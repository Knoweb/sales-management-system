import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { CalendarClock } from 'lucide-react';
import { UpcomingVirtualToursWidget } from '../features/dashboard/components/UpcomingVirtualToursWidget';

export const UpcomingVirtualToursPage: React.FC = () => {
  return (
    <>
      <PageHeader 
        title="Upcoming Virtual Tours"
        description="View and manage all your scheduled virtual tours across different clients and opportunities."
        icon={<CalendarClock size={24} />}
      />

      <div style={{ marginTop: '24px' }}>
        <UpcomingVirtualToursWidget />
      </div>
    </>
  );
};
