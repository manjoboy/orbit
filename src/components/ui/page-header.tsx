'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ─── PageHeader ─────────────────────────────────────────────────────────────
// Shared page header component with icon, title, optional subtitle,
// and right-side action slot. Standardizes all page headers to a
// consistent layout.

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;     // right-side actions slot
  className?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-[var(--color-accent)]" />
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-text-tertiary)]">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
