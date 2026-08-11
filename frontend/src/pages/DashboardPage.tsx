import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, TrendingUp, Building2, Briefcase, Calculator, FileCheck, CircleDollarSign } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { DashboardApi } from '../services/DashboardApi';
import type { DashboardMetricsDto, SalesForecastDto, UtilizationDto } from '../services/DashboardApi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [forecast, setForecast] = useState<SalesForecastDto | null>(null);
  const [utilization, setUtilization] = useState<UtilizationDto[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, fRes, uRes] = await Promise.all([
          DashboardApi.getMetrics(),
          DashboardApi.getSalesForecast(),
          DashboardApi.getUtilization()
        ]);
        setMetrics(mRes);
        setForecast(fRes);
        setUtilization(uRes);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isSalesOfficer = user?.roles.includes('SALES_OFFICER');
  const isDeptHead = user?.roles.includes('HOD');
  const isGM = user?.roles.includes('TOP_MANAGEMENT') || user?.roles.includes('SYSTEM_ADMIN');
  const isTechCoord = user?.roles.includes('TECHNICAL_COORDINATOR');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <PageHeader 
        title={`Welcome back, ${user?.firstName}!`}
        description={isSalesOfficer ? "Here is your personal sales pipeline." : "Here is the real-time company performance overview."}
        icon={<LayoutDashboard size={24} />}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {(!isTechCoord || isGM) && (
          <>
            <StatCard 
              title={isSalesOfficer ? "My Active Leads" : "Total Active Leads"} 
              value={metrics?.totalLeads || 0} 
              icon={<Users />} 
              trend={{ value: 12, isPositive: true }} 
              color="blue" 
            />
            <StatCard 
              title={isSalesOfficer ? "My Open Opportunities" : "Open Opportunities"} 
              value={metrics?.activeOpportunities || 0} 
              icon={<TrendingUp />} 
              trend={{ value: 5, isPositive: true }} 
              color="purple" 
            />
            <StatCard 
              title="Pending Quotations" 
              value={metrics?.pendingQuotations || 0} 
              icon={<FileCheck />} 
              trend={{ value: 2, isPositive: false }} 
              color="orange"
              breakdown={metrics?.quotationBreakdown}
            />
          </>
        )}
        {(isGM || isDeptHead || isTechCoord) && (
          <StatCard 
            title="Active Tech Projects" 
            value={metrics?.activeTechnicalProjects || 0} 
            icon={<Briefcase />} 
            color="indigo" 
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Revenue Forecast (For Sales & GM) */}
        {(isGM || isSalesOfficer) && (
          <Card className="card-primary">
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <CircleDollarSign size={24} style={{ color: 'var(--color-success)' }} />
                <h3 className="text-section-title" style={{ margin: 0 }}>Sales Pipeline Value</h3>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div className="text-label">Expected Revenue</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(metrics?.totalExpectedRevenue || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-label">Confirmed Revenue</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
                    {formatCurrency(metrics?.totalConfirmedRevenue || 0)}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(forecast?.forecastByStage || []).map(item => ({
                        ...item,
                        formattedStage: item.stage.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="formattedStage"
                    >
                      {(forecast?.forecastByStage || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        )}

        {/* Utilization (For HOD & GM) */}
        {(isGM || isDeptHead) && (
          <Card className="card-primary">
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <Calculator size={24} style={{ color: 'var(--color-indigo)' }} />
                <h3 className="text-section-title" style={{ margin: 0 }}>Department Utilization</h3>
              </div>
              
              <div style={{ height: '380px', width: '100%', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={utilization || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="departmentName" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6B7280' }} 
                      angle={-45}
                      textAnchor="end"
                      dy={10}
                      height={60}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6B7280' }} 
                      dx={-10} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="totalEmployees" name="Total Employees" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="activeProjects" name="Active Projects" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        )}

      </div>
    </>
  );
};
