import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAgencySettings, useUpdateAgencySettings, useTestRelevance } from '../hooks/useAgencySettings';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useAgencySettings();
  const updateSettingsMutation = useUpdateAgencySettings();
  const testRelevanceMutation = useTestRelevance();

  // Local state for credentials
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRiyaExpanded, setIsRiyaExpanded] = useState(false);
  const [riyaAgentId, setRiyaAgentId] = useState('');
  const [riyaApiKey, setRiyaApiKey] = useState('');
  const [riyaProjectId, setRiyaProjectId] = useState('');
  const [riyaRegionCode, setRiyaRegionCode] = useState('');

  // Sync state with queried settings
  useEffect(() => {
    if (settings) {
      setRiyaAgentId(settings.riyaAgentId || '');
      setRiyaApiKey(settings.riyaApiKey || '');
      setRiyaProjectId(settings.riyaProjectId || '');
      setRiyaRegionCode(settings.riyaRegionCode || '');
    }
  }, [settings]);

  const handleSaveRiya = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(
      {
        riyaAgentId,
        riyaApiKey,
        riyaProjectId,
        riyaRegionCode,
      },
      {
        onSuccess: () => {
          toast.success('Relevance AI configuration saved!');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to save settings');
        },
      }
    );
  };

  const handleTestConnection = () => {
    if (!riyaAgentId || !riyaApiKey || !riyaProjectId || !riyaRegionCode) {
      toast.error('Please fill in all credentials to run a connection test.');
      return;
    }

    toast.loading('Testing connection to Relevance AI...', { id: 'test-conn' });

    testRelevanceMutation.mutate(
      {
        riyaAgentId,
        riyaApiKey,
        riyaProjectId,
        riyaRegionCode,
      },
      {
        onSuccess: () => {
          toast.success('Connected to Relevance AI agent successfully! ✨', { id: 'test-conn' });
        },
        onError: (err) => {
          toast.error(err.message || 'Connection test failed', { id: 'test-conn' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded px-4 py-10 text-center">
        <p className="text-[13px] text-text-muted">Loading settings...</p>
      </div>
    );
  }

  const isRiyaConnected = settings?.hasRiyaApiKey && settings?.riyaAgentId;

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
          {/* RIYA AI Integration Row */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-text-primary">RIYA AI Agent</p>
                  {isRiyaConnected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-status-green bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
                      <AlertCircle size={10} /> Demo Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">Connect your Relevance AI agent for candidate screening and query-based analysis</p>
              </div>
              <button
                onClick={() => setIsRiyaExpanded(!isRiyaExpanded)}
                className="px-3 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
              >
                {isRiyaExpanded ? 'Collapse' : 'Configure'}
              </button>
            </div>

            {/* Expandable Form */}
            {isRiyaExpanded && (
              <form onSubmit={handleSaveRiya} className="mt-4 pt-4 border-t border-border-light space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                      Relevance API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={riyaApiKey}
                        onChange={(e) => setRiyaApiKey(e.target.value)}
                        placeholder={settings?.hasRiyaApiKey ? '••••••••••••••••••••' : 'Enter API Key'}
                        className="w-full pl-3 pr-9 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={riyaProjectId}
                      onChange={(e) => setRiyaProjectId(e.target.value)}
                      placeholder="e.g. b8f4d9"
                      className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                      Region Code
                    </label>
                    <input
                      type="text"
                      value={riyaRegionCode}
                      onChange={(e) => setRiyaRegionCode(e.target.value)}
                      placeholder="e.g. f1db6c"
                      className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                      Agent ID
                    </label>
                    <input
                      type="text"
                      value={riyaAgentId}
                      onChange={(e) => setRiyaAgentId(e.target.value)}
                      placeholder="Enter Agent ID"
                      className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testRelevanceMutation.isPending}
                    className="px-3 py-1.5 rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Test Connection
                  </button>
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="px-3 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Dummy Rows for other integrations */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-text-primary">Gmail Inbox</p>
              <p className="text-[11px] text-text-muted mt-0.5">Monitor incoming application emails automatically</p>
            </div>
            <button className="px-3 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
              Connect
            </button>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-text-primary">Google Sheets</p>
              <p className="text-[11px] text-text-muted mt-0.5">Sync candidate data from your recruitment spreadsheet</p>
            </div>
            <button className="px-3 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
              Connect
            </button>
          </div>
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
