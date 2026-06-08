import { useState } from 'react';
import { useJobs, useUpdateJob, useDeleteJob, useSyncJob } from '../hooks/useJobs';
import NewJobModal from '../components/jobs/NewJobModal';
import { Plus, Briefcase, MapPin, DollarSign, Users, Calendar, MoreVertical, CheckCircle2, Pause, Trash2, Sync } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'active', 'draft', 'paused', 'filled', 'archived'];

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const { data: jobs = [], isLoading, refetch } = useJobs(statusFilter);
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const syncJobMutation = useSyncJob();

  const handleToggleStatus = (job) => {
    const nextStatusMap = {
      active: 'paused',
      paused: 'active',
      draft: 'active',
    };
    const newStatus = nextStatusMap[job.status] || 'active';

    updateJobMutation.mutate(
      { id: job._id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Job marked as ${newStatus}`);
          refetch();
          setActiveMenuId(null);
        },
        onError: (err) => toast.error(err.message || 'Failed to update status'),
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this job description? This will remove the vacancy.')) {
      deleteJobMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Job deleted successfully');
          refetch();
          setActiveMenuId(null);
        },
        onError: (err) => toast.error(err.message || 'Failed to delete job'),
      });
    }
  };

  const handleSync = (id) => {
    toast.loading('Synchronizing job description...', { id: 'sync-jd' });
    syncJobMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.message || 'Job synchronized successfully', { id: 'sync-jd' });
        refetch();
        setActiveMenuId(null);
      },
      onError: (err) => toast.error(err.message || 'Failed to sync job', { id: 'sync-jd' }),
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const isEmpty = !isLoading && jobs.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[16px] font-semibold text-text-primary">Job Descriptions</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Manage active job openings and role requirements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded bg-accent hover:bg-accent-hover text-white text-[12px] font-medium transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Create Job
        </button>
      </div>

      {/* Filter Tabs */}
      {!isLoading && (
        <div className="bg-surface border border-border rounded mb-4">
          <div className="px-4 py-2 flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-[5px] rounded text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                  statusFilter === filter
                    ? 'bg-accent text-white'
                    : 'bg-surface-tertiary text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-surface border border-border rounded px-4 py-10 text-center">
          <p className="text-[13px] text-text-muted">Loading job openings...</p>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="bg-surface border border-border rounded">
          <div className="px-6 py-16 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-surface-secondary border border-border-light flex items-center justify-center mb-5">
              <Briefcase size={32} className="text-text-placeholder" strokeWidth={1.3} />
            </div>
            <h2 className="text-[15px] font-semibold text-text-primary mb-1.5">No job descriptions yet</h2>
            <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
              Create job descriptions for your open roles. RIYA will use these to screen incoming candidates against specific requirements.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-[8px] rounded bg-accent hover:bg-accent-hover text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Create first job
            </button>
          </div>
        </div>
      )}

      {/* Grid list of jobs */}
      {!isLoading && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map((job) => {
            let statusClass = 'text-status-green bg-emerald-50 border-emerald-200';
            if (job.status === 'paused') statusClass = 'text-status-amber bg-amber-50 border-amber-200';
            if (job.status === 'draft') statusClass = 'text-text-muted bg-neutral-100 border-neutral-200';
            if (job.status === 'filled') statusClass = 'text-status-blue bg-blue-50 border-blue-200';

            return (
              <div
                key={job._id}
                className="bg-surface border border-border rounded p-4 flex flex-col justify-between hover:shadow-sm transition-shadow relative"
              >
                <div>
                  {/* Status & Options */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded capitalize ${statusClass}`}>
                      {job.status}
                    </span>

                    {/* Options Button */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === job._id ? null : job._id)}
                        className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-secondary cursor-pointer"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {activeMenuId === job._id && (
                        <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded shadow-lg z-10 py-1 text-[11px] text-text-secondary">
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className="w-full text-left px-3 py-1.5 hover:bg-surface-tertiary flex items-center gap-1.5 cursor-pointer"
                          >
                            {job.status === 'active' ? (
                              <>
                                <Pause size={12} /> Pause Job
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={12} /> Activate Job
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSync(job._id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-surface-tertiary flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={12} className="opacity-0 w-0" />
                            <span>🔄 Sync to RIYA</span>
                          </button>
                          <hr className="border-border-light my-1" />
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-surface-tertiary text-status-red flex items-center gap-1.5 cursor-pointer font-medium"
                          >
                            <Trash2 size={12} /> Delete Job
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <Link to={`/jobs/${job._id}`} className="block group">
                    <h2 className="text-[13.5px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                      {job.title}
                    </h2>
                  </Link>
                  <p className="text-[11.5px] text-text-secondary mt-0.5">{job.department || 'No department'}</p>

                  {/* Meta items */}
                  <div className="mt-3.5 space-y-2 text-[11px] text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-text-placeholder" />
                      <span>{job.location || 'Remote'}</span>
                      <span className="text-border-light">•</span>
                      <span className="capitalize">{job.type.replace('-', ' ')}</span>
                    </div>

                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={12} className="text-text-placeholder" />
                        <span>
                          {job.currency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-[11px] text-text-muted">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-text-placeholder" />
                    <span className="font-semibold text-text-secondary">{job.applicantCount || 0}</span>
                    <span>applicants</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-text-placeholder" />
                    <span>{formatDate(job.postedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Job multi-step Wizard */}
      <NewJobModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); refetch(); }} />
    </div>
  );
}
