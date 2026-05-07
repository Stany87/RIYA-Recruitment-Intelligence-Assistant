export default function ChatPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[16px] font-semibold text-text-primary">Chat with RIYA</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Ask questions about candidates, get shortlist summaries, or generate interview questions</p>
      </div>

      <div className="bg-surface border border-border rounded">
        <div className="px-6 py-16 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-surface-secondary border border-border-light flex items-center justify-center mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="12" y1="7" x2="12" y2="13" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-text-primary mb-1.5">RIYA is not connected yet</h2>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            Once RIYA is connected, you can chat directly with your AI recruitment assistant. Ask about candidate comparisons, generate interview questions, or get pipeline summaries.
          </p>
          <button className="px-4 py-[8px] rounded border border-border text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
            Configure in Settings
          </button>
        </div>
      </div>
    </div>
  );
}
