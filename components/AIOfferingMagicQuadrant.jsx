import React, { useState } from 'react';

export default function AIOfferingMagicQuadrant() {
  const [hoveredOffering, setHoveredOffering] = useState(null);

  const offerings = [
    {
      id: 'cohere',
      name: 'Cohere',
      label: 'Cohere (Command + North)',
      x: 45,
      y: 65,
      score: 58.5,
      status: 'red',
      radius: 35,
      highlight: true,
      annotation: 'Primary case study\nGated by Protected B & SA&A\nApprove w/ conditions',
    },
    {
      id: 'gct',
      name: 'GC Translate',
      label: 'GC Translate (Microsoft)',
      x: 25,
      y: 40,
      score: 72,
      status: 'amber',
      radius: 28,
    },
    {
      id: 'osai',
      name: 'Open Source AI',
      label: 'Hypothetical: Self-Hosted OSS',
      x: 85,
      y: 90,
      score: 76,
      status: 'green',
      radius: 24,
    },
    {
      id: 'closedus',
      name: 'Closed US Model',
      label: 'Hypothetical: US Proprietary',
      x: 15,
      y: 15,
      score: 42,
      status: 'red',
      radius: 18,
    },
    {
      id: 'hybrid',
      name: 'Hybrid SaaS',
      label: 'Hypothetical: US Entity, Canadian Hosting',
      x: 35,
      y: 55,
      score: 64,
      status: 'amber',
      radius: 26,
    },
  ];

  const chartWidth = 900;
  const chartHeight = 700;
  const padding = 80;
  const innerW = chartWidth - padding * 2;
  const innerH = chartHeight - padding * 2;

  const scaleX = (val) => padding + (val / 100) * innerW;
  const scaleY = (val) => chartHeight - padding - (val / 100) * innerH;

  const statusColors = {
    green: '#2E7D32',
    amber: '#F9A825',
    red: '#C62828',
  };

  const statusLabels = {
    green: 'Approved',
    amber: 'Conditional',
    red: 'Disqualified/Gated',
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Offering Assessment</h1>
        <h2 style={styles.subtitle}>Magic Quadrant — Sovereignty × Openness</h2>
        <p style={styles.description}>
          HC/PHAC Enterprise Architecture positioning analysis. Bubble size = Composite Score (0–100). 
          Color = R/A/G Status. Primary case study: Cohere.
        </p>
      </div>

      <svg
        width={chartWidth}
        height={chartHeight}
        style={styles.svg}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {/* Background quadrants */}
        <rect x={padding} y={padding} width={innerW / 2} height={innerH / 2} fill="#E8F5E9" opacity="0.3" />
        <rect x={padding + innerW / 2} y={padding} width={innerW / 2} height={innerH / 2} fill="#C8E6C9" opacity="0.3" />
        <rect x={padding} y={padding + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#FFF3E0" opacity="0.3" />
        <rect x={padding + innerW / 2} y={padding + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#FFEBEE" opacity="0.3" />

        {/* Axis lines */}
        <line x1={padding} y1={padding + innerH / 2} x2={chartWidth - padding} y2={padding + innerH / 2} stroke="#ccc" strokeWidth="2" strokeDasharray="4,4" />
        <line x1={padding + innerW / 2} y1={padding} x2={padding + innerW / 2} y2={chartHeight - padding} stroke="#ccc" strokeWidth="2" strokeDasharray="4,4" />

        {/* Axis labels */}
        <text x={chartWidth - padding - 10} y={padding + innerH / 2 - 15} style={styles.axisLabel} textAnchor="end">
          Openness
        </text>
        <text x={padding - 10} y={padding + 20} style={styles.axisLabel} textAnchor="end">
          Sovereignty
        </text>

        {/* X-axis scale markers */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={`x-${val}`}>
            <line x1={scaleX(val)} y1={chartHeight - padding + 5} x2={scaleX(val)} y2={chartHeight - padding - 5} stroke="#999" strokeWidth="1" />
            <text x={scaleX(val)} y={chartHeight - padding + 20} style={styles.scaleTick} textAnchor="middle">
              {val}
            </text>
          </g>
        ))}

        {/* Y-axis scale markers */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={`y-${val}`}>
            <line x1={padding - 5} y1={scaleY(val)} x2={padding + 5} y2={scaleY(val)} stroke="#999" strokeWidth="1" />
            <text x={padding - 15} y={scaleY(val) + 5} style={styles.scaleTick} textAnchor="end">
              {val}
            </text>
          </g>
        ))}

        {/* Quadrant labels */}
        <text x={padding + innerW / 4} y={padding + innerH / 4 - 20} style={styles.quadrantLabel} textAnchor="middle" fill="#4CAF50">
          Leaders
        </text>
        <text x={padding + (3 * innerW) / 4} y={padding + innerH / 4 - 20} style={styles.quadrantLabel} textAnchor="middle" fill="#2E7D32">
          Visionaries
        </text>
        <text x={padding + innerW / 4} y={chartHeight - padding - 20} style={styles.quadrantLabel} textAnchor="middle" fill="#FF9800">
          Niche
        </text>
        <text x={padding + (3 * innerW) / 4} y={chartHeight - padding - 20} style={styles.quadrantLabel} textAnchor="middle" fill="#D32F2F">
          Laggards
        </text>

        {/* Offering bubbles */}
        {offerings.map((offering) => {
          const bx = scaleX(offering.x);
          const by = scaleY(offering.y);
          const isHovered = hoveredOffering === offering.id;

          return (
            <g
              key={offering.id}
              onMouseEnter={() => setHoveredOffering(offering.id)}
              onMouseLeave={() => setHoveredOffering(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow effect on hover */}
              {isHovered && (
                <circle
                  cx={bx}
                  cy={by}
                  r={offering.radius + 8}
                  fill="none"
                  stroke={statusColors[offering.status]}
                  strokeWidth="2"
                  opacity="0.3"
                />
              )}

              {/* Main bubble */}
              <circle
                cx={bx}
                cy={by}
                r={offering.radius}
                fill={statusColors[offering.status]}
                opacity={offering.highlight ? 0.85 : 0.7}
                stroke={offering.highlight ? '#333' : statusColors[offering.status]}
                strokeWidth={offering.highlight ? 3 : 1}
              />

              {/* Score label inside bubble */}
              <text x={bx} y={by - 8} style={styles.bubbleScore} textAnchor="middle" fill="white">
                {Math.round(offering.score)}
              </text>
              <text x={bx} y={by + 12} style={styles.bubbleLabel} textAnchor="middle" fill="white">
                {offering.name}
              </text>

              {/* Annotation for highlighted offering */}
              {offering.highlight && isHovered && (
                <>
                  <rect
                    x={bx + offering.radius + 15}
                    y={by - 60}
                    width="240"
                    height="100"
                    fill="#1B2A4A"
                    rx="8"
                    opacity="0.95"
                    stroke="#5E9EA3"
                    strokeWidth="2"
                  />
                  <text x={bx + offering.radius + 25} y={by - 40} style={styles.annotationTitle} fill="#CDE3E5">
                    {offering.label}
                  </text>
                  <text x={bx + offering.radius + 25} y={by - 15} style={styles.annotationBody} fill="#ffffff">
                    {offering.annotation}
                  </text>
                </>
              )}

              {/* Simple tooltip for other offerings */}
              {!offering.highlight && isHovered && (
                <title>{`${offering.label} — Score: ${offering.score} | Status: ${statusLabels[offering.status]}`}</title>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendGroup}>
          <h3 style={styles.legendTitle}>R/A/G Status</h3>
          <div style={styles.legendItems}>
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} style={styles.legendItem}>
                <div style={{ ...styles.legendColor, backgroundColor: statusColors[status] }} />
                <span style={styles.legendText}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.legendGroup}>
          <h3 style={styles.legendTitle}>Axis Definition</h3>
          <p style={styles.legendText}>
            <strong>X-axis (Openness):</strong> Model weights (closed ↔ open), inference runtime (vendor ↔ self-hosted), licence type.
          </p>
          <p style={styles.legendText}>
            <strong>Y-axis (Sovereignty):</strong> Corporate control, weights origin, hosting location, capital control — assessed independently.
          </p>
        </div>

        <div style={styles.legendGroup}>
          <h3 style={styles.legendTitle}>Key Insight</h3>
          <p style={styles.legendText}>
            Cohere composite score is 58.5 (Amber on numeric basis) but shows Red due to mandatory gate failures (G2 Protected B classification; G3 internal SA&A ownership). Gates override numeric scores per disqualification rule. Hover on the red Cohere bubble to see the detailed assessment.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Calibri', 'Segoe UI', sans-serif",
    padding: '40px',
    backgroundColor: '#F5F7F7',
    color: '#4A4A4A',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1B2A4A',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2F6F73',
    margin: '0 0 16px 0',
  },
  description: {
    fontSize: '14px',
    color: '#6D6E71',
    margin: 0,
    lineHeight: '1.5',
  },
  svg: {
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    marginBottom: '40px',
    maxWidth: '100%',
    height: 'auto',
  },
  axisLabel: {
    fontSize: '13px',
    fontWeight: '600',
    fill: '#2F6F73',
  },
  scaleTick: {
    fontSize: '11px',
    fill: '#999',
  },
  quadrantLabel: {
    fontSize: '14px',
    fontWeight: '700',
    opacity: 0.6,
  },
  bubbleScore: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  bubbleLabel: {
    fontSize: '12px',
    fontWeight: '600',
  },
  annotationTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  annotationBody: {
    fontSize: '11px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
  },
  legend: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '4px',
    border: '1px solid #E0E0E0',
  },
  legendGroup: {
    marginBottom: '24px',
  },
  legendTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1B2A4A',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  legendItems: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  legendText: {
    fontSize: '12px',
    color: '#6D6E71',
    lineHeight: '1.5',
    margin: 0,
  },
};
