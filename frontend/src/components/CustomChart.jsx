import React from 'react';

/**
 * Custom Bar Chart
 * data: Array of { label: string, value: number }
 */
export const BarChart = ({ data = [], height = 180 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 4); // Min ceiling of 4
  const padding = 30;
  const chartHeight = height - padding * 2;
  
  return (
    <div className="w-full h-full flex flex-col justify-end">
      <svg className="w-full" height={height} viewBox={`0 0 500 ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + chartHeight * (1 - ratio);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={500 - padding}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const barWidth = 35;
          const spacing = (500 - padding * 2) / data.length;
          const x = padding + idx * spacing + (spacing - barWidth) / 2;
          
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = height - padding - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              {/* Tooltip Overlay */}
              <rect
                x={x - 10}
                y={y - 25}
                width={barWidth + 20}
                height={20}
                rx={4}
                fill="#111827"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow"
              />
              <text
                x={x + barWidth / 2}
                y={y - 11}
                textAnchor="middle"
                fill="#00F0FF"
                fontSize="10"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                {item.value}
              </text>

              {/* Glowing bar shadow */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill="url(#barGradient)"
                opacity="0.15"
                className="blur-[4px] group-hover:opacity-30 transition-opacity"
              />

              {/* Main Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)} // Ensure at least a line is drawn
                rx={6}
                fill="url(#barGradient)"
                className="transition-all duration-300 origin-bottom hover:brightness-110"
              />

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
                className="text-slate-400 dark:text-slate-500 font-medium"
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* X Axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={500 - padding}
          y2={height - padding}
          stroke="rgba(255, 255, 255, 0.1)"
        />
      </svg>
    </div>
  );
};

/**
 * Custom Donut Chart
 * data: Array of { label: string, value: number, color: string }
 */
export const DonutChart = ({ data = [], size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedAngle = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        No analytical data recorded
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const strokeDashoffset = circumference - (circumference * percentage) / 100;
            const rotation = (accumulatedAngle * 360) / 100 - 90;
            accumulatedAngle += percentage;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} ${center} ${center})`}
                strokeLinecap="round"
                className="transition-all duration-500 hover:stroke-[16px] cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold dark:text-white text-slate-800">{total}</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-500">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs font-medium">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 capitalize">{item.label}</span>
              <span className="text-slate-400 font-mono ml-auto">({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
