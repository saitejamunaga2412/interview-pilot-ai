import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { 
  ResponsiveContainer, LineChart as ReLineChart, Line, 
  BarChart as ReBarChart, Bar, 
  AreaChart as ReAreaChart, Area, 
  PieChart as RePieChart, Pie, Cell, 
  RadarChart as ReRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const ChartContainer = ({ title, isLoading, isError, isEmpty, onRetry, className, children, height = 300 }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return (
    <Card className={className}>
      {title && <CardHeader><CardTitle>{title}</CardTitle></CardHeader>}
      <CardContent className="flex items-center justify-center" style={{ height }}>
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  );
  if (isEmpty) return <EmptyState title="No Chart Data" className={className} />;

  return (
    <Card className={className}>
      {title && <CardHeader><CardTitle>{title}</CardTitle></CardHeader>}
      <CardContent style={{ height }} className="pb-6 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-md shadow-lg text-sm">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-medium text-text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Colors mapping to our semantic tokens (approximate via hex for recharts)
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const LineChart = ({ data, lines = [], xAxisKey = 'name', ...props }) => (
  <ChartContainer {...props} isEmpty={!data || data.length === 0}>
    <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
      <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      {lines.map((line, idx) => (
        <Line 
          key={line.key} 
          type="monotone" 
          dataKey={line.key} 
          name={line.name} 
          stroke={line.color || CHART_COLORS[idx % CHART_COLORS.length]} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      ))}
    </ReLineChart>
  </ChartContainer>
);

export const BarChart = ({ data, bars = [], xAxisKey = 'name', ...props }) => (
  <ChartContainer {...props} isEmpty={!data || data.length === 0}>
    <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
      <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      {bars.map((bar, idx) => (
        <Bar 
          key={bar.key} 
          dataKey={bar.key} 
          name={bar.name} 
          fill={bar.color || CHART_COLORS[idx % CHART_COLORS.length]} 
          radius={[4, 4, 0, 0]}
        />
      ))}
    </ReBarChart>
  </ChartContainer>
);

export const AreaChart = ({ data, areas = [], xAxisKey = 'name', ...props }) => (
  <ChartContainer {...props} isEmpty={!data || data.length === 0}>
    <ReAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
      <XAxis dataKey={xAxisKey} tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: 'currentColor' }} className="text-text-muted text-xs" axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      {areas.map((area, idx) => (
        <Area 
          key={area.key} 
          type="monotone" 
          dataKey={area.key} 
          name={area.name} 
          stroke={area.color || CHART_COLORS[idx % CHART_COLORS.length]} 
          fill={area.color || CHART_COLORS[idx % CHART_COLORS.length]} 
          fillOpacity={0.2}
          strokeWidth={2}
        />
      ))}
    </ReAreaChart>
  </ChartContainer>
);

export const PieChart = ({ data, dataKey = 'value', nameKey = 'name', donut = true, ...props }) => (
  <ChartContainer {...props} isEmpty={!data || data.length === 0}>
    <RePieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        innerRadius={donut ? "60%" : 0}
        outerRadius="80%"
        paddingAngle={donut ? 5 : 0}
        stroke="none"
      >
        {data?.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
    </RePieChart>
  </ChartContainer>
);

export const RadarChart = ({ data, radarKey = 'value', nameKey = 'subject', radars = [], ...props }) => (
  <ChartContainer {...props} isEmpty={!data || data.length === 0}>
    <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke="currentColor" className="text-border" />
      <PolarAngleAxis dataKey={nameKey} tick={{ fill: 'currentColor', fontSize: 12 }} className="text-text-secondary" />
      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      {radars.map((radar, idx) => (
        <Radar 
          key={radar.key}
          name={radar.name}
          dataKey={radar.key}
          stroke={radar.color || CHART_COLORS[idx % CHART_COLORS.length]}
          fill={radar.color || CHART_COLORS[idx % CHART_COLORS.length]}
          fillOpacity={0.4}
        />
      ))}
    </ReRadarChart>
  </ChartContainer>
);
