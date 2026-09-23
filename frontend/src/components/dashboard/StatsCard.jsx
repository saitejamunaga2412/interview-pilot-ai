import React from "react";

function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  accent = "indigo",
}) {
  const accentStyles = {
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
    },
    sky: {
      bg: "bg-sky-100",
      text: "text-sky-600",
    },
  };

  const style = accentStyles[accent] || accentStyles.indigo;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </h3>

          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bg}`}
        >
          {Icon && <Icon className={`text-xl ${style.text}`} />}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;