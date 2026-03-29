import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import KpiCard from '../../components/shared/KpiCard';

export default function KpiRow() {
  const [stats, setStats] = useState({ total: 0, aiResolved: 0, pending: 0, avgResponseTime: '0s' });
  
  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => {
        if (res.data) {
          setStats(prev => ({
            ...prev,
            ...res.data
          }));
        }
      })
      .catch(err => console.error('KpiRow Fetch Error:', err));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      <KpiCard title="Total Conversations" value={(stats.total ?? 0).toString()} highlightColor="gray" />
      <KpiCard title="AI Auto-Resolved" value={(stats.aiResolved ?? 0).toString()} highlightColor="teal" />
      <KpiCard title="Pending Review" value={(stats.pending ?? 0).toString()} highlightColor="amber" />
      <KpiCard title="Avg Response Time" value={stats.avgResponseTime || '0s'} highlightColor="gray" />
    </div>
  );
}
