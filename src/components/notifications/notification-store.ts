'use client';

import { useState, useCallback } from 'react';

// ─── Types ───

export interface Notification {
  id: string;
  icon: 'message' | 'chart' | 'launch' | 'calendar' | 'check';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  group: 'now' | 'earlier' | 'yesterday';
  clickAction?: () => void;
}

// ─── Mock Data ───

function createMockNotifications(): Notification[] {
  const now = new Date();

  return [
    {
      id: 'n1',
      icon: 'message',
      title: 'Sarah Chen replied in #eng-platform',
      body: 'Re: auth dependency workaround — "I think we should go with the phased approach, let me know if you want to sync."',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 min ago
      read: false,
      group: 'now',
    },
    {
      id: 'n2',
      icon: 'chart',
      title: 'Enterprise Onboarding velocity dropped to -42%',
      body: 'Health score now at 38. 3 blockers active. Deadline in 18 days.',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      read: false,
      group: 'now',
    },
    {
      id: 'n3',
      icon: 'calendar',
      title: 'Your 2pm Product Review starts in 45 minutes',
      body: '4 attendees including Mei Zhang and David Park. 3 heads-up items flagged.',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
      read: false,
      group: 'now',
    },
    {
      id: 'n4',
      icon: 'launch',
      title: 'Intercom launched AI Agent Builder',
      body: 'Directly competes with Agent Builder v2. Sales needs a battlecard for 3 active prospects.',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      read: true,
      group: 'earlier',
    },
    {
      id: 'n5',
      icon: 'check',
      title: 'Jordan completed SSO architecture doc review',
      body: 'Review approved with minor comments. Ready for your final sign-off.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      group: 'yesterday',
    },
  ];
}

// ─── Hook ───

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(createMockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
