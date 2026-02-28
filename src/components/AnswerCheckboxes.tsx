import React from 'react';
import { AnswerKey } from '../types';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface Props {
  questionCount: number;
  answerKey: AnswerKey;
  setAnswerKey: (key: AnswerKey) => void;
}

export function AnswerCheckboxes({ questionCount, answerKey, setAnswerKey }: Props) {
  const options = ['a', 'b', 'c', 'd'];

  const handleCheck = (question: number, option: string) => {
    triggerHaptic();
    setAnswerKey({
      ...answerKey,
      [question]: option,
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6" data-flip-id="answer-checkboxes">
      <div className="space-y-2 relative z-10">
        {[...Array(questionCount)].map((_, i) => {
          const qNum = i + 1;
          return (
            <div key={qNum} className="flex items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="w-10 shrink-0 font-bold text-lg text-white">{qNum}.</span>
              <div className="flex-1 flex justify-between px-2">
                {options.map((opt) => {
                  const isSelected = answerKey[qNum] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleCheck(qNum, opt)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${
                        isSelected ? 'bg-[#3b82f6]/30' : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="font-semibold text-gray-300">{opt}.</span>
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#3b82f6] border-[#3b82f6]'
                            : 'border-[#3b82f6] bg-transparent'
                        }`}
                      >
                        {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
