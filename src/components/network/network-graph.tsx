'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';

// ─── Types ───

interface NetworkContact {
  id: string;
  name: string;
  role: string;
  importance: number;   // 0-1, determines ring placement and node size
  health: number;       // 0-1, determines color
  daysSinceContact: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  contact: NetworkContact | null;
}

// ─── Mock Data ───

const CONTACTS: NetworkContact[] = [
  { id: 'person-2', name: 'James Chen',  role: 'CTO',             importance: 0.90, health: 0.62, daysSinceContact: 5  },
  { id: 'person-4', name: 'Sarah Chen',  role: 'Staff Engineer',   importance: 0.85, health: 0.85, daysSinceContact: 1  },
  { id: 'person-5', name: 'David Park',  role: 'CFO',             importance: 0.80, health: 0.68, daysSinceContact: 0  },
  { id: 'person-1', name: 'Mei Zhang',   role: 'VP Product',       importance: 0.75, health: 0.55, daysSinceContact: 12 },
  { id: 'person-6', name: 'Jordan Liu',  role: 'Engineer II',      importance: 0.70, health: 0.90, daysSinceContact: 1  },
  { id: 'person-3', name: 'Tom Baker',   role: 'Head of Sales',    importance: 0.65, health: 0.60, daysSinceContact: 21 },
  { id: 'person-7', name: 'Alex Rivera', role: 'Senior Engineer',  importance: 0.60, health: 0.72, daysSinceContact: 3  },
];

// ─── Helpers ───

function getHealthColor(health: number): string {
  if (health >= 0.7) return 'var(--nw-emerald)';
  if (health >= 0.4) return 'var(--nw-amber)';
  return 'var(--nw-red)';
}

function getHealthFill(health: number): string {
  if (health >= 0.7) return 'var(--nw-emerald-fill)';
  if (health >= 0.4) return 'var(--nw-amber-fill)';
  return 'var(--nw-red-fill)';
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

/** Map importance (0-1) to node radius (20-40px) */
function nodeRadius(importance: number): number {
  return 20 + importance * 20;
}

/** Map importance to ring distance from center. Higher importance = closer ring. */
function ringDistance(importance: number, maxRadius: number): number {
  // importance 0.9 -> inner ring (~35%), 0.6 -> outer ring (~75%)
  const normalized = 1 - ((importance - 0.55) / 0.4);  // 0.55-0.95 -> 1-0
  const clamped = Math.max(0.25, Math.min(0.78, normalized));
  return maxRadius * clamped;
}

// ─── Component ───

export function NetworkGraph() {
  const { setActivePanel, setActiveSection } = useOrbit();
  const [animatedIn, setAnimatedIn] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, contact: null });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Trigger staggered animation
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Compute layout
  const viewWidth = 700;
  const viewHeight = 560;
  const cx = viewWidth / 2;
  const cy = viewHeight / 2;
  const maxRingRadius = Math.min(cx, cy) - 50;
  const youRadius = 28;

  // Distribute contacts in a circle at their ring distance
  const angleStep = (2 * Math.PI) / CONTACTS.length;
  const startAngle = -Math.PI / 2; // Start from top

  const contactPositions = CONTACTS.map((contact, i) => {
    const angle = startAngle + i * angleStep;
    const dist = ringDistance(contact.importance, maxRingRadius);
    const r = nodeRadius(contact.importance);
    return {
      ...contact,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r,
      angle,
    };
  });

  const handleNodeClick = useCallback((contact: NetworkContact) => {
    setActivePanel({
      type: 'person',
      title: contact.name,
      data: {
        name: contact.name,
        role: contact.role,
        subtitle: `Health: ${Math.round(contact.health * 100)}% | Last contact: ${contact.daysSinceContact}d ago`,
        action: 'Schedule sync',
      },
    });
    setActiveSection('people');
  }, [setActivePanel, setActiveSection]);

  const handleMouseEnter = useCallback((contact: NetworkContact, e: React.MouseEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    // Position tooltip relative to the SVG container
    const pos = contactPositions.find(c => c.id === contact.id);
    if (!pos) return;
    setTooltip({ visible: true, x: pos.x, y: pos.y, contact });
    setHoveredId(contact.id);
  }, [contactPositions]);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, contact: null });
    setHoveredId(null);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden network-graph-container">
      {/* Title */}
      <div className="absolute top-4 left-5 z-10">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] tracking-tight">Relationship Map</h2>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Click a contact to view details</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
          <span className="text-[10px] text-[var(--color-text-muted)]">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400/60" />
          <span className="text-[10px] text-[var(--color-text-muted)]">Needs attention</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400/60" />
          <span className="text-[10px] text-[var(--color-text-muted)]">At risk</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full h-full max-w-[700px] max-h-[560px]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Subtle glow filter for the center node */}
          <filter id="glow-center" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow for hovered nodes */}
          <filter id="glow-hover" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric ring guides */}
        {[0.35, 0.55, 0.75].map((pct, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={maxRingRadius * pct}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth="0.5"
            strokeDasharray="4 6"
            opacity={0.4}
          />
        ))}

        {/* Connection lines */}
        {contactPositions.map((pos, i) => {
          const color = getHealthColor(pos.health);
          const thickness = 1 + pos.health * 2;
          // Quadratic bezier curve - control point offset perpendicular to the line
          const midX = (cx + pos.x) / 2;
          const midY = (cy + pos.y) / 2;
          const dx = pos.x - cx;
          const dy = pos.y - cy;
          const len = Math.sqrt(dx * dx + dy * dy);
          // Perpendicular offset for curve
          const offsetMag = len * 0.12;
          const cpX = midX + (-dy / len) * offsetMag;
          const cpY = midY + (dx / len) * offsetMag;

          const isHovered = hoveredId === pos.id;

          return (
            <path
              key={`line-${pos.id}`}
              d={`M ${cx} ${cy} Q ${cpX} ${cpY} ${pos.x} ${pos.y}`}
              fill="none"
              stroke={color}
              strokeWidth={isHovered ? thickness + 1 : thickness}
              strokeLinecap="round"
              opacity={isHovered ? 0.7 : 0.25}
              className={cn(
                'transition-opacity duration-200',
                animatedIn ? 'nw-line-draw-in' : 'opacity-0'
              )}
              style={{
                animationDelay: animatedIn ? `${300 + i * 80}ms` : undefined,
              }}
            />
          );
        })}

        {/* Center "You" node */}
        <g
          className={cn(
            'transition-opacity duration-300',
            animatedIn ? 'opacity-100' : 'opacity-0'
          )}
          filter="url(#glow-center)"
        >
          <circle
            cx={cx}
            cy={cy}
            r={youRadius}
            fill="var(--color-accent-subtle)"
            stroke="var(--color-accent)"
            strokeWidth="2"
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-accent)"
            fontSize="12"
            fontWeight="600"
          >
            You
          </text>
        </g>

        {/* Contact nodes */}
        {contactPositions.map((pos, i) => {
          const color = getHealthColor(pos.health);
          const fillColor = getHealthFill(pos.health);
          const isHovered = hoveredId === pos.id;

          return (
            <g
              key={pos.id}
              className={cn(
                'cursor-pointer',
                animatedIn ? 'nw-node-fade-in' : 'opacity-0'
              )}
              style={{
                animationDelay: animatedIn ? `${150 + i * 100}ms` : undefined,
              }}
              onClick={() => handleNodeClick(pos)}
              onMouseEnter={(e) => handleMouseEnter(pos, e)}
              onMouseLeave={handleMouseLeave}
              filter={isHovered ? 'url(#glow-hover)' : undefined}
            >
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? pos.r + 2 : pos.r}
                fill={fillColor}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                className="transition-all duration-150"
              />

              {/* Initials */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={pos.r > 30 ? '12' : '10'}
                fontWeight="600"
                className="pointer-events-none select-none"
              >
                {getInitials(pos.name)}
              </text>

              {/* Name label below */}
              <text
                x={pos.x}
                y={pos.y + pos.r + 14}
                textAnchor="middle"
                fill="var(--color-text-tertiary)"
                fontSize="10"
                fontWeight="500"
                className="pointer-events-none select-none"
              >
                {pos.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && tooltip.contact && (
        <div
          className="absolute z-20 pointer-events-none nw-tooltip-fade-in"
          style={{
            left: `calc(${(tooltip.x / viewWidth) * 100}% + 0px)`,
            top: `calc(${(tooltip.y / viewHeight) * 100}% - 70px)`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] shadow-xl min-w-[160px]">
            <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{tooltip.contact.name}</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{tooltip.contact.role}</p>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[var(--color-border-subtle)]">
              <div>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Health</span>
                <p className={cn(
                  'text-[12px] font-semibold tabular-nums',
                  tooltip.contact.health >= 0.7 ? 'text-emerald-400' :
                  tooltip.contact.health >= 0.4 ? 'text-amber-400' : 'text-red-400'
                )}>
                  {Math.round(tooltip.contact.health * 100)}%
                </p>
              </div>
              <div>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Last seen</span>
                <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] tabular-nums">
                  {tooltip.contact.daysSinceContact === 0 ? 'Today' : `${tooltip.contact.daysSinceContact}d ago`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
