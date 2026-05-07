import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useUpdateStage } from '../../hooks/useCandidates';
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

function ScoreChip({ score }) {
  if (score == null) return null;
  let cls = 'badge badge-neutral';
  if (score >= 80) cls = 'badge badge-green';
  else if (score >= 60) cls = 'badge badge-amber';
  else cls = 'badge badge-red';
  return <span className={cls}>{score}</span>;
}

function FlagLabel({ rec }) {
  if (!rec) return null;
  const map = {
    SHORTLIST: { label: 'Strong Match', cls: 'text-status-green' },
    MAYBE: { label: 'Borderline', cls: 'text-status-amber' },
    REJECT: { label: 'Low Match', cls: 'text-status-red' },
  };
  const info = map[rec];
  if (!info) return null;
  return <span className={`text-[10px] font-medium ${info.cls}`}>{info.label}</span>;
}

function CandidateCard({ candidate, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate._id,
    data: { candidate },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={() => onClick?.(candidate)}
      className={`bg-surface border border-border rounded p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <p className="text-[13px] font-medium text-text-primary truncate">{candidate.name}</p>
      <p className="text-[11px] text-text-muted truncate mt-0.5">{candidate.jobAppliedFor || 'No role specified'}</p>
      <div className="flex items-center gap-2 mt-2">
        <ScoreChip score={candidate.aiScore} />
        <FlagLabel rec={candidate.aiRecommendation} />
      </div>
    </div>
  );
}

function DragOverlayCard({ candidate }) {
  return (
    <div className="bg-surface border border-border rounded p-3 shadow-lg w-52 rotate-1">
      <p className="text-[13px] font-medium text-text-primary truncate">{candidate.name}</p>
      <p className="text-[11px] text-text-muted truncate mt-0.5">{candidate.jobAppliedFor || 'No role specified'}</p>
      <div className="flex items-center gap-2 mt-2">
        <ScoreChip score={candidate.aiScore} />
      </div>
    </div>
  );
}

function KanbanColumn({ stage, candidates, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex-shrink-0 w-56">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
          {stage.label}
        </h3>
        <span className="text-[11px] text-text-placeholder font-medium">
          {candidates.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-2 p-1 rounded transition-colors ${
          isOver ? 'bg-surface-tertiary' : ''
        }`}
      >
        {candidates.map((c) => (
          <CandidateCard key={c._id} candidate={c} onClick={onCardClick} />
        ))}
        {candidates.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-[11px] text-text-placeholder">No candidates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateKanban({ candidates, onCardClick, onRefetch }) {
  const [activeCandidate, setActiveCandidate] = useState(null);
  const updateStage = useUpdateStage();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Group candidates by stage
  const grouped = {};
  STAGES.forEach((s) => (grouped[s.id] = []));
  (candidates || []).forEach((c) => {
    if (grouped[c.stage]) grouped[c.stage].push(c);
    else grouped.new_application.push(c);
  });

  const handleDragStart = (event) => {
    const candidate = event.active.data.current?.candidate;
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = (event) => {
    setActiveCandidate(null);
    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id;
    const newStage = over.id;
    const candidate = active.data.current?.candidate;

    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update is handled by TanStack Query refetch
    updateStage.mutate(
      { id: candidateId, stage: newStage },
      {
        onSuccess: () => {
          toast.success(`Moved to ${STAGES.find((s) => s.id === newStage)?.label}`);
          onRefetch?.();
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to move candidate');
          onRefetch?.();
        },
      }
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            candidates={grouped[stage.id]}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? <DragOverlayCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
