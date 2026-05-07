import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[16px] font-semibold text-text-primary">Settings</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Agency configuration and account preferences</p>
      </div>

      {/* Agency Profile */}
      <div className="bg-surface border border-border rounded mb-3">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-semibold text-text-primary">Agency Profile</h2>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">Agency Name</label>
              <p className="text-[13px] text-text-primary">{user?.agencyName || '—'}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">Account Owner</label>
              <p className="text-[13px] text-text-primary">{user?.name || '—'}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">Email</label>
              <p className="text-[13px] text-text-primary">{user?.email || '—'}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">Role</label>
              <p className="text-[13px] text-text-primary capitalize">{user?.role || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-surface border border-border rounded mb-3">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-semibold text-text-primary">Integrations</h2>
        </div>
        <div className="divide-y divide-border-light">
          {[
            { name: 'RIYA AI Agent', desc: 'Connect your Relevance AI agent for candidate screening', connected: false },
            { name: 'Gmail Inbox', desc: 'Monitor incoming application emails automatically', connected: false },
            { name: 'Google Sheets', desc: 'Sync candidate data from your recruitment spreadsheet', connected: false },
          ].map((item) => (
            <div key={item.name} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-text-primary">{item.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
              </div>
              <button className="px-3 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-surface border border-border rounded">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text-primary">Team Members</h2>
          <button className="px-3 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
            Invite member
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-semibold text-[12px]">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-primary">{user?.name}</p>
              <p className="text-[11px] text-text-muted">{user?.email} — <span className="capitalize">{user?.role}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
