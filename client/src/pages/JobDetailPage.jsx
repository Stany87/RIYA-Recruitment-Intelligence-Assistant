import { useParams, Link } from 'react-router-dom';
import { useJob, useJobFunnel, useSyncJob, useUpdateJob } from '../hooks/useJobs';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Users, RefreshCw, CheckCircle, ListTodo, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STAGE_LABELS = {
  new_application: 'New Application',
  ai_screened: 'AI Screened',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { data: job, isLoading, refetch: refetchJob } = useJob(id);
  const { data: funnel = {}, isLoading: isFunnelLoading, refetch: refetchFunnel } = useJobFunnel(id);

  const syncJobMutation = useSyncJob();
  const updateJobMutation = useUpdateJob();

  const handleSync = () => {
    toast.loading('Synchronizing job description with RIYA Knowledge Base...', { id: 'sync-kb' });
    syncJobMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.message || 'Job synchronized successfully', { id: 'sync-kb' });
        refetchJob();
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to sync job description', { id: 'sync-kb' });
      },
    });
  };

  const handleToggleStatus = () => {
    const nextStatusMap = {
      active: 'paused',
      paused: 'active',
      draft: 'active',
    };
    const newStatus = nextStatusMap[job.status] || 'active';

    updateJobMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Job marked as ${newStatus}`);
          refetchJob();
        },
        onError: (err) => toast.error(err.message || 'Failed to update job status'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded px-4 py-10 text-center">
        <p className="text-[13px] text-text-muted">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-surface border border-border rounded px-6 py-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 text-status-red flex items-center justify-center mb-4 mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-[15px] font-semibold text-text-primary mb-1">Job Description Not Found</h2>
        <p className="text-[12px] text-text-muted mb-5">
          This vacancy may have been deleted, or it belongs to another agency account.
        </p>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors">
          <ArrowLeft size={13} /> Back to Jobs
        </Link>
      </div>
    );
  }

  // Calculate total applicants for funnel progress bars
  const funnelValues = Object.values(funnel);
  const maxCount = Math.max(...funnelValues, 1); // Avoid division by zero

  let statusClass = 'text-status-green bg-emerald-50 border-emerald-200';
  if (job.status === 'paused') statusClass = 'text-status-amber bg-amber-50 border-amber-200';
  if (job.status === 'draft') statusClass = 'text-text-muted bg-neutral-100 border-neutral-200';
  if (job.status === 'filled') statusClass = 'text-status-blue bg-blue-50 border-blue-200';

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={13} /> Back to Job Descriptions
        </Link>
      </div>

      {/* Main Job Header Card */}
      <div className="bg-surface border border-border rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[16px] font-bold text-text-primary leading-tight">{job.title}</h1>
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded capitalize ${statusClass}`}>
              {job.status}
            </span>
          </div>
          <p className="text-[12.5px] text-text-secondary mt-1">
            {job.department || 'General'} • {job.location || 'Remote'} ({job.type.replace('-', ' ')})
          </p>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className="px-3 py-1.5 rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
          >
            {job.status === 'active' ? 'Pause Vacancy' : 'Reactivate Vacancy'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncJobMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncJobMutation.isPending ? 'animate-spin' : ''} />
            Sync to RIYA KB
          </button>
          <Link
            to={`/candidates?jobId=${job._id}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-[11px] font-medium transition-colors"
          >
            <Users size={12} />
            View Candidates
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Job Spec Details */}
        <div className="lg:col-span-2 space-y-3">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface border border-border rounded p-3 text-[12px]">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-text-placeholder" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Min Experience</p>
                <p className="text-text-primary font-medium">{job.experienceMin}+ Years</p>
              </div>
            </div>

            {job.salaryMin && job.salaryMax && (
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-text-placeholder" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Salary Range</p>
                  <p className="text-text-primary font-medium">
                    {job.currency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-placeholder" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Date Posted</p>
                <p className="text-text-primary font-medium">
                  {new Date(job.postedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface border border-border rounded p-4">
            <h2 className="text-[13px] font-bold text-text-primary border-b border-border pb-2 mb-3">
              Role Overview
            </h2>
            <div className="text-[12.5px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {job.description || <p className="text-text-placeholder italic">No detailed description has been uploaded yet.</p>}
            </div>
          </div>

          {/* Requirements & Nice to Haves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Requirements */}
            <div className="bg-surface border border-border rounded p-4">
              <h3 className="text-[12.5px] font-bold text-text-primary flex items-center gap-1.5 border-b border-border pb-2 mb-3">
                <CheckCircle size={14} className="text-status-green" /> Core Requirements
              </h3>
              <ul className="space-y-2 text-[12px] text-text-secondary">
                {job.requirements && job.requirements.length > 0 ? (
                  job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-status-green font-bold">✓</span>
                      <span>{req}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-text-placeholder italic">No core requirements specified.</p>
                )}
              </ul>
            </div>

            {/* Nice to Haves */}
            <div className="bg-surface border border-border rounded p-4">
              <h3 className="text-[12.5px] font-bold text-text-primary flex items-center gap-1.5 border-b border-border pb-2 mb-3">
                <ListTodo size={14} className="text-status-blue" /> Nice to Haves
              </h3>
              <ul className="space-y-2 text-[12px] text-text-secondary">
                {job.niceToHave && job.niceToHave.length > 0 ? (
                  job.niceToHave.map((nice, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-status-blue font-bold">▪</span>
                      <span>{nice}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-text-placeholder italic">No nice-to-have skills specified.</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Funnel Stats */}
        <div className="space-y-3">
          <div className="bg-surface border border-border rounded p-4">
            <h2 className="text-[13px] font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2 mb-3">
              <Users size={14} className="text-accent" /> Candidate Funnel
            </h2>

            {isFunnelLoading ? (
              <p className="text-[11px] text-text-muted text-center py-4">Loading funnel details...</p>
            ) : (
              <div className="space-y-3.5 pt-1.5">
                {Object.entries(STAGE_LABELS).map(([stageId, label]) => {
                  const count = funnel[stageId] || 0;
                  const pct = Math.max(Math.min((count / maxCount) * 100, 100), 0);

                  // Funnel color mapping
                  let barColor = 'bg-accent';
                  if (stageId === 'hired') barColor = 'bg-emerald-500';
                  if (stageId === 'rejected') barColor = 'bg-red-500';

                  return (
                    <div key={stageId} className="space-y-1 text-[11.5px]">
                      <div className="flex items-center justify-between text-text-secondary font-medium">
                        <span>{label}</span>
                        <span className="text-text-primary font-semibold">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 border border-border-light rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
