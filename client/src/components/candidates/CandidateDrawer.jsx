import { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useCandidate, useUpdateStage, useUpdateNotes, useUpdateRecruiterScore } from '../../hooks/useCandidates';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'new_application', label: 'New Application' },
  { id: 'ai_screened', label: 'AI Screened' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

function ScoreGauge({ score }) {
  if (score == null) return <span className="text-text-placeholder">—</span>;
  let color = '#525252';
  if (score >= 80) color = '#15803d';
  else if (score >= 60) color = '#a16207';
  else color = '#b91c1c';

  return (
    <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 mx-auto" style={{ borderColor: color }}>
      <span className="text-[18px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function CandidateDrawer({ candidateId, onClose, onRefetch }) {
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const updateStage = useUpdateStage();
  const updateNotes = useUpdateNotes();
  const updateScore = useUpdateRecruiterScore();

  const [notes, setNotes] = useState('');
  const [localScore, setLocalScore] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    if (candidate) {
      setNotes(candidate.recruiterNotes || '');
      setLocalScore(candidate.recruiterScore || '');
      setSelectedStage(candidate.stage || '');
    }
  }, [candidate]);

  if (!candidateId) return null;

  const handleStageChange = (newStage) => {
    setSelectedStage(newStage);
    updateStage.mutate(
      { id: candidateId, stage: newStage },
      {
        onSuccess: () => {
          toast.success(`Stage updated`);
          onRefetch?.();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleNotesBlur = () => {
    if (notes !== (candidate?.recruiterNotes || '')) {
      updateNotes.mutate({ id: candidateId, recruiterNotes: notes });
    }
  };

  const handleScoreChange = (val) => {
    const num = parseInt(val);
    if (val === '') {
      setLocalScore('');
      return;
    }
    if (num >= 1 && num <= 10) {
      setLocalScore(num);
      updateScore.mutate(
        { id: candidateId, recruiterScore: num },
        {
          onSuccess: () => onRefetch?.(),
          onError: (err) => toast.error(err.message),
        }
      );
    }
  };

  const getNextStage = () => {
    const idx = STAGES.findIndex((s) => s.id === selectedStage);
    if (idx >= 0 && idx < STAGES.length - 2) return STAGES[idx + 1]; // skip 'rejected'
    return null;
  };

  const nextStage = getNextStage();
  const screening = candidate?.aiScreeningData || {};

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[520px] bg-surface border-l border-border overflow-y-auto shadow-xl">
        {isLoading ? (
          <div className="p-6 text-[13px] text-text-muted">Loading candidate data...</div>
        ) : !candidate ? (
          <div className="p-6 text-[13px] text-text-muted">Candidate not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-border px-5 py-3 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[15px] font-semibold text-text-primary">{candidate.name}</h2>
                <p className="text-[12px] text-text-muted">{candidate.email}</p>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-surface-tertiary text-text-muted">
                <X size={16} />
              </button>
            </div>

            {/* Body: two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-border">
              {/* Left: AI Screening Data */}
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">AI Screening Data</p>
                  <ScoreGauge score={candidate.aiScore} />
                  {candidate.aiRecommendation && (
                    <div className="text-center mt-2">
                      <span className={`badge ${
                        candidate.aiRecommendation === 'SHORTLIST' ? 'badge-green' :
                        candidate.aiRecommendation === 'MAYBE' ? 'badge-amber' : 'badge-red'
                      }`}>
                        {candidate.aiRecommendation === 'SHORTLIST' ? 'Strong Match' :
                         candidate.aiRecommendation === 'MAYBE' ? 'Borderline' : 'Low Match'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {screening.strengths?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary mb-1.5">Strengths</p>
                    <ul className="space-y-1">
                      {screening.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-text-secondary">
                          <CheckCircle size={12} className="text-status-green mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gaps */}
                {screening.gaps?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary mb-1.5">Gaps</p>
                    <ul className="space-y-1">
                      {screening.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-text-secondary">
                          <AlertTriangle size={12} className="text-status-amber mt-0.5 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {screening.redFlags?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary mb-1.5">Red Flags</p>
                    <ul className="space-y-1">
                      {screening.redFlags.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-text-secondary">
                          <XCircle size={12} className="text-status-red mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Job applied for */}
                {candidate.jobAppliedFor && (
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary mb-1">Applied For</p>
                    <p className="text-[12px] text-text-secondary">{candidate.jobAppliedFor}</p>
                  </div>
                )}
              </div>

              {/* Right: Recruiter Actions */}
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">Recruiter Actions</p>

                {/* Current Stage */}
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Current Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className="w-full px-2.5 py-[7px] rounded border border-border bg-white text-[13px] text-text-primary"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Recruiter Notes */}
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">Recruiter Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    rows={4}
                    placeholder="Add notes about this candidate..."
                    className="w-full px-2.5 py-2 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder resize-none"
                  />
                </div>

                {/* Recruiter Score Override */}
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Recruiter Score Override <span className="text-text-placeholder font-normal">(1-10)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={localScore}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    placeholder="—"
                    className="w-20 px-2.5 py-[7px] rounded border border-border bg-white text-[13px] text-text-primary"
                  />
                </div>

                {/* Stage History */}
                {candidate.stageHistory?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary mb-2">Stage History</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {[...candidate.stageHistory].reverse().map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                          <div>
                            <p className="text-[11px] text-text-primary font-medium">
                              {STAGES.find((s) => s.id === h.stage)?.label || h.stage}
                            </p>
                            <p className="text-[10px] text-text-muted">
                              {new Date(h.movedAt).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                              {h.note && ` — ${h.note}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-surface border-t border-border px-5 py-3 flex items-center gap-2">
              {nextStage && (
                <button
                  onClick={() => handleStageChange(nextStage.id)}
                  className="flex-1 py-[7px] px-3 rounded bg-accent hover:bg-accent-hover text-white text-[12px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  Move to {nextStage.label} <ChevronRight size={12} />
                </button>
              )}
              <button
                onClick={() => handleStageChange('rejected')}
                className="py-[7px] px-3 rounded border border-status-red text-status-red text-[12px] font-medium hover:bg-status-red-bg transition-colors cursor-pointer"
              >
                Reject
              </button>
              {candidate.email && (
                <a
                  href={`mailto:${candidate.email}`}
                  className="py-[7px] px-3 rounded border border-border text-[12px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
                >
                  Email
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
