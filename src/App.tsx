import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { AnswerKey, StudentTest } from './types';
import { ClassInformation } from './components/ClassInformation';
import { AnswerCheckboxes } from './components/AnswerCheckboxes';
import { UploadSection } from './components/UploadSection';
import { Results } from './components/Results';
import { Auth } from './components/Auth';
import { analyzeTestImage } from './lib/gemini';
import { List, Trash2, LogOut, Loader2 } from 'lucide-react';
import { triggerHaptic } from './utils/haptic';
import { useUserData } from './hooks/useUserData';
import { auth } from './lib/firebase';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export default function App() {
  const {
    user,
    loading,
    classes,
    setClasses,
    studentCount,
    setStudentCount,
    questionCount,
    setQuestionCount,
    answerKey,
    setAnswerKey
  } = useUserData();

  const [currentPage, setCurrentPage] = useState<'input' | 'results'>('input');
  const [uploadedTests, setUploadedTests] = useState<StudentTest[]>([]);
  
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<any>(null);

  useEffect(() => {
    const checkOrientation = () => {
      const newIsLandscape = window.innerWidth > window.innerHeight;
      if (newIsLandscape !== isLandscape) {
        // Capture state BEFORE updating React state
        flipStateRef.current = Flip.getState('.flip-item');
        setIsLandscape(newIsLandscape);
      }
    };
    
    // Initial check
    setIsLandscape(window.innerWidth > window.innerHeight);
    
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [isLandscape]);

  useLayoutEffect(() => {
    if (flipStateRef.current && containerRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.6,
        ease: 'power2.inOut',
        absolute: true,
        nested: true,
      });
      flipStateRef.current = null;
    }
  }, [isLandscape]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newTests: StudentTest[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'analyzing',
    }));

    setUploadedTests((prev) => [...prev, ...newTests]);

    for (const test of newTests) {
      try {
        const base64 = await fileToBase64(test.file);
        const mimeType = test.file.type;
        const result = await analyzeTestImage(base64, mimeType);

        setUploadedTests((prev) =>
          prev.map((t) => {
            if (t.id === test.id) {
              if (result.error) {
                return { ...t, status: 'error', errorMessage: result.error };
              }
              
              // Calculate score
              let score = 0;
              if (result.answers) {
                for (let i = 1; i <= questionCount; i++) {
                  if (result.answers[i] && result.answers[i].toLowerCase() === answerKey[i]?.toLowerCase()) {
                    score++;
                  }
                }
              }

              // Check for duplicate
              const isDuplicate = prev.some(
                (existing) => 
                  existing.status === 'success' && 
                  existing.studentNumber === result.studentNumber &&
                  existing.id !== t.id
              );

              return {
                ...t,
                status: 'success',
                studentNumber: result.studentNumber,
                answers: result.answers,
                score,
                isDuplicate,
              };
            }
            return t;
          })
        );
      } catch (error) {
        setUploadedTests((prev) =>
          prev.map((t) =>
            t.id === test.id ? { ...t, status: 'error', errorMessage: 'Failed to analyze' } : t
          )
        );
      }
    }
  };

  const removeTest = (id: string) => {
    setUploadedTests((prev) => prev.filter((t) => t.id !== id));
  };

  const isAnalyzing = uploadedTests.some((t) => t.status === 'analyzing');
  const scoredCount = uploadedTests.filter((t) => t.status === 'success').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-dots text-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-dots text-white font-sans pb-32 overflow-x-hidden">
      {currentPage === 'input' ? (
        <div className={`mx-auto p-4 ${isLandscape ? 'max-w-5xl' : 'max-w-md'}`} ref={containerRef}>
          <div className="relative pt-4 pb-2 text-center flip-item flex items-center justify-between" data-flip-id="header">
            <div className="w-10"></div> {/* Spacer for centering */}
            <div>
              <h1 className="text-2xl font-bold">Answer Key Input</h1>
              <p className="text-gray-400 text-sm mt-1">Select correct answers for each question (1-{questionCount})</p>
            </div>
            <button
              onClick={() => {
                triggerHaptic();
                auth.signOut();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>

          <div className={`grid gap-6 mt-6 ${isLandscape ? 'grid-cols-2 items-start' : 'grid-cols-1'}`}>
            {/* Left Column in Landscape */}
            <div className="flex flex-col space-y-6">
              <div className="flip-item" data-flip-id="class-info-container">
                <ClassInformation
                  studentCount={studentCount}
                  setStudentCount={setStudentCount}
                  questionCount={questionCount}
                  setQuestionCount={setQuestionCount}
                  classes={classes}
                  setClasses={setClasses}
                />
              </div>

              <div className="flip-item" data-flip-id="upload-section-container">
                <UploadSection
                  uploadedTests={uploadedTests}
                  onUpload={handleFileUpload}
                  onRemove={removeTest}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>

            {/* Right Column in Landscape */}
            <div className="flex flex-col space-y-6">
              <div className="flip-item" data-flip-id="checkboxes-container">
                <AnswerCheckboxes
                  questionCount={questionCount}
                  answerKey={answerKey}
                  setAnswerKey={setAnswerKey}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flip-item" data-flip-id="clear-button-container">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setAnswerKey({});
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-4 rounded-xl font-bold text-lg transition-colors border border-red-500/20"
                  >
                    <Trash2 size={24} />
                    Clear Answers
                  </button>
                </div>

                {isLandscape && (
                  <div className="flip-item" data-flip-id="view-results-container">
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setCurrentPage('results');
                      }}
                      disabled={isAnalyzing || studentCount === 0}
                      className="w-full flex items-center justify-center gap-2 bg-[#107c41] hover:bg-[#0e6b38] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#107c41]/30 border border-white/10"
                    >
                      <List size={24} />
                      View Results
                      {scoredCount > 0 && (
                        <span className="bg-white text-[#107c41] text-xs px-2 py-1 rounded-full ml-2 font-bold">
                          {scoredCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spacer to prevent content from being hidden behind fixed bottom bar if not landscape */}
          {!isLandscape && <div className="h-24" />}
          
          {/* Fixed bottom bar only in portrait mode */}
          {!isLandscape && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 z-50">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setCurrentPage('results');
                  }}
                  disabled={isAnalyzing || studentCount === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#107c41] hover:bg-[#0e6b38] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#107c41]/30 border border-white/10"
                >
                  <List size={24} />
                  View Results
                  {scoredCount > 0 && (
                    <span className="bg-white text-[#107c41] text-xs px-2 py-1 rounded-full ml-2 font-bold">
                      {scoredCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Results
          studentCount={studentCount}
          uploadedTests={uploadedTests}
          onBack={() => setCurrentPage('input')}
        />
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}
