export default function SettingsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[16px] font-semibold text-text-primary">Settings</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Agency configuration and account preferences</p>
      </div>

      <div className="bg-surface border border-border rounded">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text-primary">Configuration</h2>
          <span className="badge badge-neutral">Phase 5</span>
        </div>
        <div className="px-4 py-10 text-center">
          <p className="text-[13px] text-text-muted mb-1">Settings panel is not yet available.</p>
          <p className="text-[12px] text-text-placeholder">
            Agency profile, team management, and integration settings will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
