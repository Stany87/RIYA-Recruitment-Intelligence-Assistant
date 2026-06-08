import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useCreateJob } from '../../hooks/useJobs';
import toast from 'react-hot-toast';

export default function NewJobModal({ isOpen, onClose }) {
  const createJobMutation = useCreateJob();
  const [step, setStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('full-time');
  const [experienceMin, setExperienceMin] = useState(0);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [niceToHave, setNiceToHave] = useState([]);
  const [status, setStatus] = useState('active');

  // Input states for tag arrays
  const [reqInput, setReqInput] = useState('');
  const [niceInput, setNiceInput] = useState('');

  if (!isOpen) return null;

  const handleAddRequirement = (e) => {
    e.preventDefault();
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (idx) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddNiceToHave = (e) => {
    e.preventDefault();
    if (niceInput.trim() && !niceToHave.includes(niceInput.trim())) {
      setNiceToHave([...niceToHave, niceInput.trim()]);
      setNiceInput('');
    }
  };

  const handleRemoveNiceToHave = (idx) => {
    setNiceToHave(niceToHave.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Job title is required');
      setStep(1);
      return;
    }

    createJobMutation.mutate(
      {
        title,
        department,
        location,
        type,
        experienceMin: parseInt(experienceMin) || 0,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        currency,
        description,
        requirements,
        niceToHave,
        status,
      },
      {
        onSuccess: () => {
          toast.success('Job vacancy posted successfully!');
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create job');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-text-primary">Create New Job Description</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[12px]">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Job Title <span className="text-status-red">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru (Hybrid)"
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Job Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Min Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={experienceMin}
                    onChange={(e) => setExperienceMin(e.target.value)}
                    min={0}
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="INR"
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Salary Min
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Salary Max
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description */}
          {step === 2 && (
            <div className="space-y-2 h-full flex flex-col">
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                Full Job Description (Supports Markdown / Plain Text)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                placeholder="Describe responsibilities, expectations, day-to-day work, etc."
                className="w-full flex-1 px-3 py-2 rounded border border-border bg-white text-[12.5px] text-text-primary focus:outline-none focus:border-accent resize-none min-h-[200px]"
              />
            </div>
          )}

          {/* STEP 3: Requirements */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Requirements tag builder */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Core Requirements
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    placeholder="Type a requirement and press Enter"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement(e)}
                    className="flex-1 px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleAddRequirement}
                    className="px-3 rounded border border-border hover:bg-surface-secondary text-text-primary flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {requirements.map((req, idx) => (
                    <span key={req} className="inline-flex items-center gap-1 text-[10.5px] font-medium bg-neutral-100 border border-neutral-200 text-text-secondary px-2 py-0.5 rounded-full">
                      {req}
                      <button type="button" onClick={() => handleRemoveRequirement(idx)} className="hover:text-status-red text-[12px] font-bold cursor-pointer">×</button>
                    </span>
                  ))}
                  {requirements.length === 0 && <p className="text-[11px] text-text-placeholder">No requirements added yet.</p>}
                </div>
              </div>

              {/* Nice to haves tag builder */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Nice to Have Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={niceInput}
                    onChange={(e) => setNiceInput(e.target.value)}
                    placeholder="Type nice-to-have skill and press Enter"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNiceToHave(e)}
                    className="flex-1 px-3 py-1.5 rounded border border-border bg-white text-[12px] text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleAddNiceToHave}
                    className="px-3 rounded border border-border hover:bg-surface-secondary text-text-primary flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {niceToHave.map((nice, idx) => (
                    <span key={nice} className="inline-flex items-center gap-1 text-[10.5px] font-medium bg-neutral-100 border border-neutral-200 text-text-secondary px-2 py-0.5 rounded-full">
                      {nice}
                      <button type="button" onClick={() => handleRemoveNiceToHave(idx)} className="hover:text-status-red text-[12px] font-bold cursor-pointer">×</button>
                    </span>
                  ))}
                  {niceToHave.length === 0 && <p className="text-[11px] text-text-placeholder">No nice-to-haves added yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Publish */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border border-border rounded p-3 space-y-2 bg-surface-secondary">
                <h3 className="text-[12.5px] font-bold text-text-primary">{title || 'Untitled Job'}</h3>
                <p className="text-text-secondary">
                  {department} • {location} ({type.replace('-', ' ')})
                </p>
                {salaryMin && salaryMax && (
                  <p className="text-text-muted">
                    Salary: {currency} {salaryMin.toLocaleString()} - {salaryMax.toLocaleString()}
                  </p>
                )}
                {experienceMin > 0 && (
                  <p className="text-text-muted">Experience: {experienceMin}+ years</p>
                )}
              </div>

              <div className="space-y-1 bg-white border border-border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">Sync to RIYA AI Knowledge Base</p>
                    <p className="text-[10.5px] text-text-muted mt-0.5">Automatically uploads this JD to RIYA's knowledge index for candidate scoring.</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-accent cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-surface-secondary rounded-b-xl">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={13} /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !title.trim()) {
                  toast.error('Job title is required');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-[11px] font-medium transition-colors cursor-pointer"
            >
              Continue <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createJobMutation.isPending}
              className="px-4 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
