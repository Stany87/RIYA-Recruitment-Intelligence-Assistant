import { ChevronLeft, ChevronRight } from 'lucide-react';

const STAGE_LABELS = {
  new_application: 'New',
  ai_screened: 'AI Screened',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-text-placeholder text-[12px]">—</span>;
  let cls = 'badge badge-neutral';
  if (score >= 80) cls = 'badge badge-green';
  else if (score >= 60) cls = 'badge badge-amber';
  else cls = 'badge badge-red';
  return <span className={cls}>{score}</span>;
}

function RecommendationBadge({ rec }) {
  if (!rec) return <span className="text-text-placeholder text-[12px]">—</span>;
  const map = {
    SHORTLIST: 'badge badge-green',
    MAYBE: 'badge badge-amber',
    REJECT: 'badge badge-red',
  };
  return <span className={map[rec] || 'badge badge-neutral'}>{rec}</span>;
}

function StageBadge({ stage }) {
  return <span className="badge badge-neutral">{STAGE_LABELS[stage] || stage}</span>;
}

export default function CandidateTable({ candidates, pagination, onPageChange, onRowClick }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-[13px] text-text-muted">No candidates match the current filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide">Name</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide">Email</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide">Job Applied For</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide text-center">Score</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide text-center">Recommendation</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide text-center">Stage</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c._id}
                onClick={() => onRowClick?.(c)}
                className="border-b border-border-light hover:bg-surface-secondary cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 text-[13px] font-medium text-text-primary">{c.name}</td>
                <td className="px-4 py-2.5 text-[13px] text-text-secondary">{c.email}</td>
                <td className="px-4 py-2.5 text-[13px] text-text-secondary">{c.jobAppliedFor || '—'}</td>
                <td className="px-4 py-2.5 text-center"><ScoreBadge score={c.aiScore} /></td>
                <td className="px-4 py-2.5 text-center"><RecommendationBadge rec={c.aiRecommendation} /></td>
                <td className="px-4 py-2.5 text-center"><StageBadge stage={c.stage} /></td>
                <td className="px-4 py-2.5 text-[12px] text-text-muted">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-[12px] text-text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[12px] text-text-secondary px-2">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1 rounded hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
