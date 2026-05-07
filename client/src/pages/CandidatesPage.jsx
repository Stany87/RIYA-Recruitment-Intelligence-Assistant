import { useState, useCallback } from 'react';
import { Search, LayoutList, Columns3 } from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateKanban from '../components/candidates/CandidateKanban';
import CandidateDrawer from '../components/candidates/CandidateDrawer';

const REC_FILTERS = ['all', 'SHORTLIST', 'MAYBE', 'REJECT'];

export default function CandidatesPage() {
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recommendation, setRecommendation] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  // Debounced search
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(window.__candidateSearchTimer);
    window.__candidateSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
  }, []);

  // For table: paginated fetch
  const { data, isLoading, refetch } = useCandidates({
    page,
    limit: view === 'table' ? 25 : 200, // kanban fetches all
    search: debouncedSearch,
    recommendation,
  });

  const candidates = data?.candidates || [];
  const pagination = data?.pagination;

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
      </div>

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
              className={`p-1.5 transition-colors cursor-pointer ${
                view === 'table' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-tertiary'
              }`}
              title="Table View"
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 transition-colors cursor-pointer ${
                view === 'kanban' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-tertiary'
              }`}
              title="Pipeline View"
            >
              <Columns3 size={14} />
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
