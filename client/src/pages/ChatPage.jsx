export default function ChatPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[16px] font-semibold text-text-primary">Chat with RIYA</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Query candidates, get shortlist summaries, or generate interview questions</p>
      </div>

      <div className="bg-surface border border-border rounded">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text-primary">RIYA Assistant</h2>
          <span className="badge badge-neutral">Phase 3</span>
        </div>
        <div className="px-4 py-10 text-center">
          <p className="text-[13px] text-text-muted mb-1">Chat interface is not yet available.</p>
          <p className="text-[12px] text-text-placeholder">
            The Relevance AI agent integration will be configured in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
