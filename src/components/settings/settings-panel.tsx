'use client';

import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useOrbit } from '../orbit-app';
import {
  X,
  User,
  Clock,
  Bell,
  Info,
  Check,
  Minus,
} from 'lucide-react';

// ─── Types ───

interface BriefingPreferences {
  priorityInbox: boolean;
  meetings: boolean;
  projects: boolean;
  intel: boolean;
  people: boolean;
  wellbeing: boolean;
}

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  slack: boolean;
}

interface IntegrationStatus {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
}

// ─── Default values ───

const DEFAULT_BRIEFING_PREFS: BriefingPreferences = {
  priorityInbox: true,
  meetings: true,
  projects: true,
  intel: true,
  people: true,
  wellbeing: true,
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  inApp: true,
  email: true,
  slack: false,
};

const DEFAULT_INTEGRATIONS: IntegrationStatus[] = [
  { id: 'slack', name: 'Slack', connected: true, icon: '\u{1F4AC}' },
  { id: 'gmail', name: 'Gmail', connected: true, icon: '\u{2709}\u{FE0F}' },
  { id: 'gcal', name: 'Google Calendar', connected: true, icon: '\u{1F4C5}' },
  { id: 'linear', name: 'Linear', connected: false, icon: '\u{1F4CB}' },
  { id: 'github', name: 'GitHub', connected: false, icon: '\u{1F500}' },
  { id: 'notion', name: 'Notion', connected: false, icon: '\u{1F4DD}' },
];

const BRIEFING_TIMES = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'];

// ─── Briefing section labels ───
const BRIEFING_SECTIONS: Array<{ key: keyof BriefingPreferences; label: string; description: string }> = [
  { key: 'priorityInbox', label: 'Priority Inbox', description: 'Urgent messages and action items' },
  { key: 'meetings', label: 'Meetings', description: 'Upcoming prep and context' },
  { key: 'projects', label: 'Projects', description: 'Health scores and blockers' },
  { key: 'intel', label: 'Intel', description: 'Industry news and competitive signals' },
  { key: 'people', label: 'People', description: 'Relationship alerts and suggestions' },
  { key: 'wellbeing', label: 'Wellbeing', description: 'Workload balance and wellness' },
];

// ─── Toggle Switch ───
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? 'bg-[var(--color-accent-strong)]' : 'bg-[var(--color-bg-elevated)]'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

// ─── Main Component ───
export function SettingsPanel() {
  const { setActivePanel } = useOrbit();

  // Persisted settings
  const [briefingPrefs, setBriefingPrefs] = useLocalStorage<BriefingPreferences>(
    'orbit-briefing-prefs',
    DEFAULT_BRIEFING_PREFS,
  );
  const [briefingTime, setBriefingTime] = useLocalStorage<string>(
    'orbit-briefing-time',
    '9:00 AM',
  );
  const [notificationPrefs, setNotificationPrefs] = useLocalStorage<NotificationPreferences>(
    'orbit-notification-prefs',
    DEFAULT_NOTIFICATION_PREFS,
  );
  const [integrations, setIntegrations] = useLocalStorage<IntegrationStatus[]>(
    'orbit-integrations',
    DEFAULT_INTEGRATIONS,
  );

  const handleClose = () => {
    setActivePanel({ type: null });
  };

  const updateBriefingPref = (key: keyof BriefingPreferences, value: boolean) => {
    setBriefingPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotificationPref = (key: keyof NotificationPreferences, value: boolean) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
    );
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Settings</span>
        <button
          onClick={handleClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
        {/* Profile */}
        <section>
          <SectionHeader icon={<User className="w-3.5 h-3.5" />} title="Profile" />
          <div className="mt-3 space-y-3">
            <ProfileRow label="Name" value="Alex Chen" />
            <ProfileRow label="Email" value="alex@company.com" />
            <ProfileRow label="Timezone" value="PST (UTC-8)" />
          </div>
        </section>

        <Divider />

        {/* Briefing Preferences */}
        <section>
          <SectionHeader icon={<Check className="w-3.5 h-3.5" />} title="Briefing Preferences" />
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1 mb-3">
            Choose which sections appear in your daily briefing
          </p>
          <div className="space-y-1">
            {BRIEFING_SECTIONS.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{s.label}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.description}</p>
                </div>
                <Toggle
                  checked={briefingPrefs[s.key]}
                  onChange={(v) => updateBriefingPref(s.key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Briefing Schedule */}
        <section>
          <SectionHeader icon={<Clock className="w-3.5 h-3.5" />} title="Briefing Schedule" />
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1 mb-3">
            When should Orbit prepare your daily briefing?
          </p>
          <select
            value={briefingTime}
            onChange={(e) => setBriefingTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235c5c66' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            {BRIEFING_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </section>

        <Divider />

        {/* Connected Integrations */}
        <section>
          <SectionHeader
            icon={
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
            title="Connected Integrations"
          />
          <div className="mt-3 space-y-2">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px]">{integration.icon}</span>
                  <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
                    {integration.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={cn(
                    'text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors',
                    integration.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-tertiary)]'
                  )}
                >
                  {integration.connected ? 'Connected' : 'Disconnected'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Notifications */}
        <section>
          <SectionHeader icon={<Bell className="w-3.5 h-3.5" />} title="Notifications" />
          <div className="mt-3 space-y-1">
            <ToggleRow
              label="In-app"
              description="Show notifications inside Orbit"
              checked={notificationPrefs.inApp}
              onChange={(v) => updateNotificationPref('inApp', v)}
            />
            <ToggleRow
              label="Email"
              description="Receive daily briefing via email"
              checked={notificationPrefs.email}
              onChange={(v) => updateNotificationPref('email', v)}
            />
            <ToggleRow
              label="Slack"
              description="Get alerts in your Slack DMs"
              checked={notificationPrefs.slack}
              onChange={(v) => updateNotificationPref('slack', v)}
            />
          </div>
        </section>

        <Divider />

        {/* About */}
        <section>
          <SectionHeader icon={<Info className="w-3.5 h-3.5" />} title="About" />
          <div className="mt-3 px-3 py-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Orbit v0.1.0
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Your professional world, connected
            </p>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── Shared Sub-components ───

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
      <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[12px] text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
      <div>
        <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[var(--color-border-subtle)]" />;
}
