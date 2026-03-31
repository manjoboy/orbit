'use client';

import { cn, healthScoreColor, healthScoreBg } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock } from 'lucide-react';

interface ProjectUpdate {
  projectId: string;
  projectName: string;
  status: string;
  healthScore: number;
  healthTrend: 'improving' | 'stable' | 'declining';
  velocityChange: number;
  blockerCount: number;
  keyUpdate: string;
  riskFlag?: string;
  daysUntilDeadline?: number;
}

export function ProjectHealthGrid({ projects }: { projects: ProjectUpdate[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
          Project Health
        </h2>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {projects.filter(p => p.status === 'AT_RISK').length} at risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.projectId} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: ProjectUpdate; index: number }) {
  const TrendIcon = project.healthTrend === 'improving' ? TrendingUp :
                    project.healthTrend === 'declining' ? TrendingDown :
                    Minus;

  const trendColor = project.healthTrend === 'improving' ? 'text-emerald-400' :
                     project.healthTrend === 'declining' ? 'text-red-400' :
                     'text-[var(--color-text-muted)]';

  const healthPct = Math.round(project.healthScore * 100);

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 transition-all duration-200',
        'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]',
        'hover:border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-elevated)]',
        'stagger-item animate-fade-in opacity-0',
        project.status === 'AT_RISK' && 'border-l-2 border-l-orange-500/60'
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {project.projectName}
          </h3>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
            {project.keyUpdate}
          </p>
        </div>

        {/* Health Score Ring */}
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
          healthScoreBg(project.healthScore)
        )}>
          <span className={cn('text-sm font-semibold', healthScoreColor(project.healthScore))}>
            {healthPct}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-3">
        {/* Velocity */}
        <div className="flex items-center gap-1">
          <TrendIcon className={cn('w-3 h-3', trendColor)} />
          <span className={cn('text-[11px] font-medium', trendColor)}>
            {project.velocityChange > 0 ? '+' : ''}{project.velocityChange}%
          </span>
        </div>

        {/* Blockers */}
        {project.blockerCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-amber-400 font-medium">
              {project.blockerCount} blocked
            </span>
          </div>
        )}

        {/* Deadline */}
        {project.daysUntilDeadline !== undefined && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span className={cn(
              'text-[11px] font-medium',
              project.daysUntilDeadline < 7 ? 'text-amber-400' :
              project.daysUntilDeadline < 3 ? 'text-red-400' :
              'text-[var(--color-text-muted)]'
            )}>
              {project.daysUntilDeadline}d left
            </span>
          </div>
        )}

        {/* Risk flag */}
        {project.riskFlag && (
          <span className="ml-auto text-[10px] font-medium text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
            {project.riskFlag}
          </span>
        )}
      </div>

      {/* Health bar */}
      <div className="mt-3 h-1 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            project.healthScore >= 0.7 ? 'bg-emerald-500' :
            project.healthScore >= 0.4 ? 'bg-yellow-500' :
            'bg-red-500'
          )}
          style={{ width: `${healthPct}%` }}
        />
      </div>
    </div>
  );
}
