import React from 'react';
import './Visualization.css';

// Bar Chart Component
const BarChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="visualization-placeholder">No data available for visualization</div>;
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="bar-chart">
        <div className="y-axis-label">{yAxisLabel}</div>
        <div className="chart-content">
          <div className="bars-container">
            {data.map((item, index) => (
              <div key={index} className="bar-item">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#4f46e5'
                  }}
                >
                  <div className="bar-value">{item.value}</div>
                </div>
                <div className="bar-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="x-axis">
            <div className="x-axis-line"></div>
            <div className="x-axis-label">{xAxisLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pie Chart Component
const PieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div className="visualization-placeholder">No data available for visualization</div>;
  }

  // Calculate total value
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate angles for each segment
  let startAngle = 0;
  const segments = data.map(item => {
    const angle = (item.value / totalValue) * 360;
    const segment = {
      ...item,
      startAngle,
      angle
    };
    startAngle += angle;
    return segment;
  });

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="pie-chart">
        <svg viewBox="0 0 100 100" className="pie-chart-svg">
          {segments.map((segment, index) => {
            // Calculate the path for the segment
            const x1 = 50 + 40 * Math.cos((segment.startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((segment.startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((segment.startAngle + segment.angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((segment.startAngle + segment.angle) * Math.PI) / 180);
            
            // Large arc flag (1 if angle > 180, 0 otherwise)
            const largeArcFlag = segment.angle > 180 ? 1 : 0;
            
            // Path data
            const pathData = [
              `M 50 50`, // Move to center
              `L ${x1} ${y1}`, // Line to start point
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end point
              'Z' // Close path
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color || `hsl(${index * 30}, 70%, 50%)`}
                stroke="#fff"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
        <div className="pie-chart-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color || `hsl(${index * 30}, 70%, 50%)` }}
              ></div>
              <div className="legend-label">{item.label}</div>
              <div className="legend-value">{item.value} ({Math.round((item.value / totalValue) * 100)}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Radar Chart Component
const RadarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div className="visualization-placeholder">No data available for visualization</div>;
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value));

  // Calculate points for the radar chart
  const numPoints = data.length;
  const centerX = 50;
  const centerY = 50;
  const radius = 40;

  const points = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const distance = (item.value / maxValue) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Generate grid lines
  const gridLines = [];
  for (let i = 1; i <= 4; i++) {
    const r = (radius * i) / 4;
    const circlePoints = [];
    for (let j = 0; j < numPoints; j++) {
      const angle = (j * 2 * Math.PI) / numPoints - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      circlePoints.push(`${x},${y}`);
    }
    gridLines.push(circlePoints.join(' '));
  }

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="radar-chart">
        <svg viewBox="0 0 100 100" className="radar-chart-svg">
          {/* Grid lines */}
          {gridLines.map((points, index) => (
            <polygon
              key={index}
              points={points}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Axes */}
          {data.map((item, index) => {
            const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Data polygon */}
          <polygon
            points={points}
            fill="rgba(79, 70, 229, 0.2)"
            stroke="#4f46e5"
            strokeWidth="1"
          />
          
          {/* Points */}
          {points.split(' ').map((point, index) => {
            const [x, y] = point.split(',');
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#4f46e5"
              />
            );
          })}
          
          {/* Labels */}
          {data.map((item, index) => {
            const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
            const labelRadius = radius + 5;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="3"
                fill="#333"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ value, max, title, color = '#4f46e5' }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="progress-ring">
        <svg viewBox="0 0 100 100" className="progress-ring-svg">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fill={color}
            fontWeight="bold"
          >
            {Math.round(progress)}%
          </text>
        </svg>
        <div className="progress-ring-label">
          {value} out of {max}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component
const LineChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="visualization-placeholder">No data available for visualization</div>;
  }

  // Find min and max values for scaling
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // Calculate points for the line
  const numPoints = data.length;
  const padding = 10;
  const chartWidth = 100 - 2 * padding;
  const chartHeight = 80;
  const pointSpacing = chartWidth / (numPoints - 1);

  const points = data.map((item, index) => {
    const x = padding + index * pointSpacing;
    const y = 100 - padding - ((item.value - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="line-chart">
        <div className="y-axis-label">{yAxisLabel}</div>
        <div className="chart-content">
          <svg viewBox="0 0 100 100" className="line-chart-svg">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + (percent / 100) * chartHeight}
                x2={100 - padding}
                y2={padding + (percent / 100) * chartHeight}
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Axes */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={100 - padding}
              stroke="#ccc"
              strokeWidth="0.5"
            />
            <line
              x1={padding}
              y1={100 - padding}
              x2={100 - padding}
              y2={100 - padding}
              stroke="#ccc"
              strokeWidth="0.5"
            />
            
            {/* Data line */}
            <polyline
              points={points}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="1"
            />
            
            {/* Data points */}
            {points.split(' ').map((point, index) => {
              const [x, y] = point.split(',');
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#4f46e5"
                />
              );
            })}
            
            {/* X-axis labels */}
            {data.map((item, index) => {
              const x = padding + index * pointSpacing;
              const y = 100 - padding + 5;
              return (
                <text
                  key={index}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="3"
                  fill="#333"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
          <div className="x-axis">
            <div className="x-axis-line"></div>
            <div className="x-axis-label">{xAxisLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Scatter Plot Component
const ScatterPlot = ({ data, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="visualization-placeholder">No data available for visualization</div>;
  }

  // Find min and max values for scaling
  const xValues = data.map(item => item.x);
  const yValues = data.map(item => item.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const xRange = maxX - minX || 1; // Avoid division by zero
  const yRange = maxY - minY || 1; // Avoid division by zero

  // Padding for chart
  const padding = 10;
  const chartWidth = 100 - 2 * padding;
  const chartHeight = 80;

  return (
    <div className="visualization-container">
      <h3 className="visualization-title">{title}</h3>
      <div className="scatter-plot">
        <div className="y-axis-label">{yAxisLabel}</div>
        <div className="chart-content">
          <svg viewBox="0 0 100 100" className="scatter-plot-svg">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + (percent / 100) * chartHeight}
                x2={100 - padding}
                y2={padding + (percent / 100) * chartHeight}
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Axes */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={100 - padding}
              stroke="#ccc"
              strokeWidth="0.5"
            />
            <line
              x1={padding}
              y1={100 - padding}
              x2={100 - padding}
              y2={100 - padding}
              stroke="#ccc"
              strokeWidth="0.5"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = padding + ((item.x - minX) / xRange) * chartWidth;
              const y = 100 - padding - ((item.y - minY) / yRange) * chartHeight;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={item.size || "2"}
                  fill={item.color || "#4f46e5"}
                  opacity="0.7"
                />
              );
            })}
            
            {/* Axis labels */}
            <text
              x="50"
              y="95"
              textAnchor="middle"
              fontSize="3"
              fill="#333"
            >
              {xAxisLabel}
            </text>
          </svg>
          <div className="x-axis">
            <div className="x-axis-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BarChart, PieChart, RadarChart, ProgressRing, LineChart, ScatterPlot };