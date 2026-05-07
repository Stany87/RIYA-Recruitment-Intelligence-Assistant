export default function JobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[16px] font-semibold text-text-primary">Job Descriptions</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Manage active job openings and role requirements</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text-primary">Active Roles</h2>
          <span className="badge badge-neutral">Phase 4</span>
        </div>
        <div className="px-4 py-10 text-center">
          <p className="text-[13px] text-text-muted mb-1">No job descriptions have been created.</p>
          <p className="text-[12px] text-text-placeholder">
            Add job descriptions here. RIYA will use them to evaluate incoming candidates.
          </p>
        </div>
      </div>
    </div>
  );
}
