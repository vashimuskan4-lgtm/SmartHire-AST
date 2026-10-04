import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "indigo" | "emerald" | "amber" | "purple" | "rose";
  trend?: string;
  subtext?: string;
  onClick?: () => void;
}

export default React.memo(function StatCard({
  label,
  value,
  icon,
  color = "indigo",
  trend,
  subtext,
  onClick
}: StatCardProps) {
  return (
    <div
      className={`stat-card theme-${color} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <div className={`stat-icon-box color-${color}`}>{icon}</div>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      <div className="stat-card-details">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
});
