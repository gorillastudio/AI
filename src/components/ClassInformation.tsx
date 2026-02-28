import React, { useState } from 'react';
import { Plus, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface ClassData {
  id: string;
  label: string;
  count: number;
}

interface Props {
  studentCount: number;
  setStudentCount: (count: number) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  classes: ClassData[];
  setClasses: (classes: ClassData[]) => void;
}

export function ClassInformation({ studentCount, setStudentCount, questionCount, setQuestionCount, classes, setClasses }: Props) {
  const [isEditingClasses, setIsEditingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const addClass = () => {
    triggerHaptic();
    const newId = Math.random().toString(36).substring(7);
    setClasses([...classes, { id: newId, label: `P${classes.length + 1}`, count: 30 }]);
  };

  const removeClass = (id: string) => {
    triggerHaptic();
    setClasses(classes.filter((c) => c.id !== id));
  };

  const updateClass = (id: string, field: 'label' | 'count', value: string | number) => {
    setClasses(classes.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="glass-panel rounded-3xl p-6" data-flip-id="class-info">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-xl font-bold text-white">Class Information</h2>
        <button
          onClick={() => {
            triggerHaptic();
            setIsEditingClasses(!isEditingClasses);
          }}
          className={`p-2 rounded-xl transition-colors border border-white/10 ${
            isEditingClasses ? 'bg-[#3b82f6] text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <Edit2 size={16} />
        </button>
      </div>

      {isEditingClasses && (
        <div className="space-y-3 mb-6 bg-white/10 p-4 rounded-2xl border border-white/10 relative z-10">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Edit Classes</h3>
          {classes.map((c) => (
            <div key={c.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={c.label}
                onChange={(e) => updateClass(c.id, 'label', e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-2 border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-[#3b82f6] focus:outline-none"
                placeholder="Name"
              />
              <input
                type="number"
                value={c.count}
                onChange={(e) => updateClass(c.id, 'count', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent border-2 border-white/10 rounded-xl px-2 py-2 text-center text-white text-sm focus:border-[#3b82f6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
              <button
                onClick={() => {
                  triggerHaptic();
                  removeClass(c.id);
                }}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={addClass}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-xl text-sm font-semibold transition-colors border border-[#3b82f6]/30"
          >
            <Plus size={16} />
            Add Class
          </button>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Amount of students in class:</span>
          <input
            type="number"
            min="0"
            max="50"
            inputMode="numeric"
            pattern="[0-9]*"
            value={studentCount || ''}
            onChange={(e) => {
              setStudentCount(Math.min(50, parseInt(e.target.value) || 0));
              setSelectedClassId(null);
            }}
            className="w-16 bg-transparent border-2 border-[#3b82f6] rounded-xl px-2 py-2 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={studentCount || 0}
          onChange={(e) => {
            setStudentCount(parseInt(e.target.value));
            setSelectedClassId(null);
          }}
          style={{
            background: `linear-gradient(to right, #0ea5e9 ${((studentCount || 0) / 50) * 100}%, #e5e7eb ${((studentCount || 0) / 50) * 100}%)`
          }}
          className="custom-slider mb-4"
        />

        <div className="grid grid-cols-3 gap-2 pb-4">
          {classes.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                triggerHaptic();
                setStudentCount(preset.count);
                setSelectedClassId(preset.id);
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/10 ${
                selectedClassId === preset.id
                  ? 'bg-[#3b82f6] text-white shadow-sm border-[#3b82f6]/50'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {preset.label} ({preset.count})
            </button>
          ))}
        </div>

        <div className="border-b border-white/5"></div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-gray-300 font-medium">Number of questions:</span>
          <input
            type="number"
            min="1"
            max="50"
            inputMode="numeric"
            pattern="[0-9]*"
            value={questionCount || ''}
            onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 bg-transparent border-2 border-[#3b82f6] rounded-xl px-2 py-2 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="10"
          />
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={questionCount}
          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
          style={{
            background: `linear-gradient(to right, #0ea5e9 ${((questionCount - 1) / 49) * 100}%, #e5e7eb ${((questionCount - 1) / 49) * 100}%)`
          }}
          className="custom-slider mb-4"
        />

        <div className="grid grid-cols-2 gap-2 pb-2">
          <button
            onClick={() => {
              triggerHaptic();
              setQuestionCount(10);
            }}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/10 ${
              questionCount === 10
                ? 'bg-[#3b82f6] text-white shadow-sm border-[#3b82f6]/50'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Unit (10)
          </button>
          <button
            onClick={() => {
              triggerHaptic();
              setQuestionCount(20);
            }}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/10 ${
              questionCount === 20
                ? 'bg-[#3b82f6] text-white shadow-sm border-[#3b82f6]/50'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Final (20)
          </button>
        </div>

        <button
          onClick={() => {
            triggerHaptic();
            setStudentCount(0);
            setSelectedClassId(null);
            setQuestionCount(10);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-semibold transition-colors text-red-400 border border-red-500/20"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}
