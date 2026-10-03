import React from "react";
export default React.memo(function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><div className="muted">{label}</div><strong>{value}</strong></div></div>;
});
