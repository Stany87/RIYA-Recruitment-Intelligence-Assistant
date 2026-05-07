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
        <div className="px-6 py-16 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-surface-secondary border border-border-light flex items-center justify-center mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-text-primary mb-1.5">No job descriptions yet</h2>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            Create job descriptions for your open roles. RIYA will use these to screen incoming candidates against specific requirements.
          </p>
          <button className="px-4 py-[8px] rounded bg-accent hover:bg-accent-hover text-white text-[13px] font-medium transition-colors cursor-pointer">
            Create first job
          </button>
        </div>
      </div>
    </div>
  );
}
