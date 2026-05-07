import { useAuth } from '../contexts/AuthContext';
import { useDashboardStats, useActivityFeed } from '../hooks/useCandidates';

const ACTION_LABELS = {
  stage_changed: 'moved candidate',
  candidates_synced: 'synced candidates from external source',
  recruiter_score_set: 'set recruiter score for',
  notes_updated: 'updated notes for',
  candidate_created: 'added candidate',
};

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities } = useActivityFeed();

  const statCards = [
    { label: 'Candidates in Review', value: stats?.inReview },
    { label: 'Shortlisted This Week', value: stats?.shortlistedThisWeek },
    { label: 'Interviews Scheduled', value: stats?.interviewsThisWeek },
    { label: 'Placements This Month', value: stats?.placementsThisMonth },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[16px] font-semibold text-text-primary">Dashboard</h1>
        <p className="text-[13px] text-text-muted mt-0.5">
          {user?.agencyName} — Overview
          {stats?.totalCandidates > 0 && (
            <span className="ml-2 text-text-placeholder">
              ({stats.totalCandidates} total candidate{stats.totalCandidates !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded px-4 py-3">
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-2">
              {stat.label}
            </p>
            <p className="text-[24px] font-semibold text-text-primary leading-none">
              {statsLoading ? '...' : (stat.value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[13px] font-semibold text-text-primary">Recent Activity</h2>
          </div>
          {!activities || activities.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-text-muted">No activity yet. Candidate actions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {activities.slice(0, 10).map((a) => (
                <div key={a._id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] text-text-secondary truncate">
                      {ACTION_LABELS[a.action] || a.action}
                      {a.metadata?.candidateName && (
                        <span className="font-medium text-text-primary ml-1">{a.metadata.candidateName}</span>
                      )}
                      {a.metadata?.newStage && (
                        <span className="text-text-muted ml-1">to {a.metadata.newStage.replace(/_/g, ' ')}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-placeholder shrink-0 ml-3">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-surface border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[13px] font-semibold text-text-primary">System Status</h2>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-secondary">RIYA Agent</span>
              <span className="badge badge-green">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-secondary">Gmail Monitor</span>
              <span className="badge badge-neutral">Pending Setup</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-secondary">Google Sheet Sync</span>
              <span className="badge badge-neutral">Pending Setup</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-secondary">Database</span>
              <span className="badge badge-green">Connected</span>
            </div>
          </div>

          {/* Stage Distribution */}
          {stats?.stageDistribution && stats.totalCandidates > 0 && (
            <>
              <div className="px-4 py-3 border-t border-border">
                <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Pipeline Distribution</h3>
                <div className="space-y-1.5">
                  {Object.entries(stats.stageDistribution).map(([stage, count]) => {
                    if (count === 0) return null;
                    const pct = Math.round((count / stats.totalCandidates) * 100);
                    return (
                      <div key={stage} className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted w-20 truncate capitalize">
                          {stage.replace(/_/g, ' ')}
                        </span>
                        <div className="flex-1 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-placeholder w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
