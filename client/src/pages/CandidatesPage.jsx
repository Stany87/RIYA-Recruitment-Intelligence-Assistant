import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, LayoutList, Columns3, Upload, Plus } from 'lucide-react';
import { useCandidates, useSyncCandidates } from '../hooks/useCandidates';
import { useJob } from '../hooks/useJobs';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateKanban from '../components/candidates/CandidateKanban';
import CandidateDrawer from '../components/candidates/CandidateDrawer';
import toast from 'react-hot-toast';

const REC_FILTERS = ['all', 'SHORTLIST', 'MAYBE', 'REJECT'];

export default function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recommendation, setRecommendation] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const syncMutation = useSyncCandidates();
  const { data: filteredJob } = useJob(jobId);

  // Debounced search
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(window.__candidateSearchTimer);
    window.__candidateSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
  }, []);

  const { data, isLoading, refetch } = useCandidates({
    page,
    limit: view === 'table' ? 25 : 200,
    search: debouncedSearch,
    recommendation,
    jobId: jobId || undefined,
  });

  const candidates = data?.candidates || [];
  const pagination = data?.pagination;
  const isEmpty = !isLoading && candidates.length === 0 && !debouncedSearch && recommendation === 'all';

  const handleSyncDemo = () => {
    const demoCandidates = [
      { name: "Aarav Patel", email: "aarav@example.com", jobAppliedFor: "Senior Backend Engineer", aiScore: 87, aiRecommendation: "SHORTLIST", strengths: ["Strong Node.js experience", "MongoDB expertise", "System design"], gaps: ["No Docker experience"], redFlags: [] },
      { name: "Priya Sharma", email: "priya@example.com", jobAppliedFor: "Data Scientist (AI)", aiScore: 72, aiRecommendation: "MAYBE", strengths: ["Python proficiency", "Statistical modeling"], gaps: ["Limited ML deployment", "No research papers"], redFlags: [] },
      { name: "Rahul Gupta", email: "rahul@example.com", jobAppliedFor: "Product Manager (SaaS)", aiScore: 45, aiRecommendation: "REJECT", strengths: ["Good communication"], gaps: ["No SaaS experience", "No product metrics"], redFlags: ["Short tenure at previous roles"] },
      { name: "Anjali Desai", email: "anjali@example.com", jobAppliedFor: "Senior Backend Engineer", aiScore: 91, aiRecommendation: "SHORTLIST", strengths: ["8+ years backend", "System design expertise", "Mentoring experience"], gaps: [], redFlags: [] },
      { name: "Vikram Singh", email: "vikram@example.com", jobAppliedFor: "Data Scientist (AI)", aiScore: 68, aiRecommendation: "MAYBE", strengths: ["Statistical modeling"], gaps: ["No deep learning", "Limited Python"], redFlags: ["Employment gap"] },
      { name: "Neha Joshi", email: "neha@example.com", jobAppliedFor: "Senior Backend Engineer", aiScore: 82, aiRecommendation: "SHORTLIST", strengths: ["Express.js expert", "API design"], gaps: ["Limited frontend experience"], redFlags: [] },
    ];

    syncMutation.mutate(demoCandidates, {
      onSuccess: (res) => {
        const d = res.data;
        toast.success(`Imported ${d.created} candidates, updated ${d.updated}`);
        refetch();
      },
      onError: (err) => toast.error(err.message || 'Sync failed'),
    });
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[16px] font-semibold text-text-primary">Candidates</h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            Manage applicants across your recruitment pipeline
          </p>
        </div>
        {!isEmpty && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDemo}
              disabled={syncMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-[7px] rounded border border-border text-[12px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload size={13} />
              {syncMutation.isPending ? 'Importing...' : 'Import from Sheet'}
            </button>
          </div>
        )}
      </div>

      {/* Empty state — shown when no candidates exist */}
      {isEmpty ? (
        <div className="bg-surface border border-border rounded">
          <div className="px-6 py-16 flex flex-col items-center text-center max-w-md mx-auto">
            {/* Illustration */}
            <div className="w-20 h-20 rounded-2xl bg-surface-secondary border border-border-light flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-text-primary mb-1.5">No candidates yet</h2>
            <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
              Import candidates from your Google Sheet to get started, or add them manually. RIYA will automatically screen future applicants.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncDemo}
                disabled={syncMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-[8px] rounded bg-accent hover:bg-accent-hover text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload size={14} />
                {syncMutation.isPending ? 'Importing...' : 'Import from Google Sheet'}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-[8px] rounded border border-border text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer">
                <Plus size={14} />
                Add manually
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Job Filter Banner */}
          {jobId && filteredJob && (
            <div className="mb-3 px-3 py-2 bg-neutral-100 border border-border rounded flex items-center justify-between text-[11px] text-text-secondary">
              <span>Filtering candidates by job: <strong className="text-text-primary">{filteredJob.title}</strong></span>
              <button 
                onClick={() => {
                  searchParams.delete('jobId');
                  setSearchParams(searchParams);
                }}
                className="text-accent font-semibold hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Filter bar */}
          <div className="bg-surface border border-border rounded mb-3">
            <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-placeholder" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full pl-8 pr-3 py-[6px] rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder"
                />
              </div>

              {/* Recommendation filter */}
              <div className="flex items-center gap-1">
                {REC_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setRecommendation(f); setPage(1); }}
                    className={`px-2.5 py-[5px] rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      recommendation === f
                        ? 'bg-accent text-white'
                        : 'bg-surface-tertiary text-text-secondary hover:bg-surface-secondary'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-border rounded overflow-hidden ml-auto">
                <button
                  onClick={() => setView('table')}
                  className={`px-2.5 py-[5px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    view === 'table' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-tertiary'
                  }`}
                  title="Table View"
                >
                  <LayoutList size={13} />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-2.5 py-[5px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    view === 'kanban' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-tertiary'
                  }`}
                  title="Pipeline View"
                >
                  <Columns3 size={13} />
                  <span className="hidden sm:inline">Pipeline</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="bg-surface border border-border rounded px-4 py-10 text-center">
              <p className="text-[13px] text-text-muted">Loading candidates...</p>
            </div>
          ) : view === 'table' ? (
            <div className="bg-surface border border-border rounded">
              <CandidateTable
                candidates={candidates}
                pagination={pagination}
                onPageChange={setPage}
                onRowClick={(c) => setSelectedId(c._id)}
              />
            </div>
          ) : (
            <CandidateKanban
              candidates={candidates}
              onCardClick={(c) => setSelectedId(c._id)}
              onRefetch={refetch}
            />
          )}
        </>
      )}

      {/* Candidate Detail Drawer */}
      {selectedId && (
        <CandidateDrawer
          candidateId={selectedId}
          onClose={() => setSelectedId(null)}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
