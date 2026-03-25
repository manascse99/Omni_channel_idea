import KpiCard from '../../components/shared/KpiCard';

export default function KpiRow() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      <KpiCard title="Total Conversations Today" value="482" subValue="+12%" highlightColor="gray" />
      <KpiCard title="AI Auto-Resolved" value="312" subValue="64.7% Efficiency" subValueStyle="pill" highlightColor="teal" />
      <KpiCard title="Pending Human Review" value="45" highlightColor="amber" />
      <KpiCard title="Avg Response Time" value="2m 15s" subValue="-14s" highlightColor="gray" />
    </div>
  );
}
