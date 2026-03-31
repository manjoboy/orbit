import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getGreeting(name?: string): string {
  const time = getTimeOfDay();
  const greeting = time === 'morning' ? 'Good morning' :
                   time === 'afternoon' ? 'Good afternoon' :
                   'Good evening';
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + '…';
}

export function healthScoreColor(score: number): string {
  if (score >= 0.8) return 'text-emerald-400';
  if (score >= 0.6) return 'text-green-400';
  if (score >= 0.4) return 'text-yellow-400';
  if (score >= 0.2) return 'text-orange-400';
  return 'text-red-400';
}

export function healthScoreBg(score: number): string {
  if (score >= 0.8) return 'bg-emerald-500/10';
  if (score >= 0.6) return 'bg-green-500/10';
  if (score >= 0.4) return 'bg-yellow-500/10';
  if (score >= 0.2) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-blue-400';
  }
}

export function severityBadgeClasses(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
    default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
}

export function sourceIcon(source: string): string {
  switch (source.toLowerCase()) {
    case 'slack': return '💬';
    case 'gmail': return '✉️';
    case 'google_calendar': return '📅';
    case 'linear': return '📋';
    case 'github': return '🔀';
    case 'notion': return '📝';
    default: return '📌';
  }
}
