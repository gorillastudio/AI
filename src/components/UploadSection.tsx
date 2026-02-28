import React, { useRef } from 'react';
import { StudentTest } from '../types';
import { Image as ImageIcon, Camera, X, Check, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface Props {
  uploadedTests: StudentTest[];
  onUpload: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  isAnalyzing: boolean;
}

export function UploadSection({ uploadedTests, onUpload, onRemove, isAnalyzing }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-4 transition-all duration-300">
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white">Upload Student Tests</h2>
        <p className="text-gray-400 text-sm mt-1">
          {uploadedTests.length === 0 ? 'No tests uploaded yet' : `${uploadedTests.length} test(s) uploaded`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => onUpload(e.target.files)}
        />
        <button
          onClick={() => {
            triggerHaptic();
            fileInputRef.current?.click();
          }}
          className="flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3.5 rounded-2xl font-semibold transition-all duration-300 border border-white/10 shadow-lg"
        >
          <ImageIcon size={20} className="text-white" />
          Gallery
        </button>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={(e) => onUpload(e.target.files)}
        />
        <button
          onClick={() => {
            triggerHaptic();
            cameraInputRef.current?.click();
          }}
          className="flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3.5 rounded-2xl font-semibold transition-all duration-300 border border-white/10 shadow-lg"
        >
          <Camera size={20} className="text-white" />
          Camera
        </button>
      </div>

      {uploadedTests.length > 0 && (
        <div className="pt-4 space-y-4 relative z-10">
          <h3 className="font-bold text-white">Uploaded Photos ({uploadedTests.length})</h3>
          <div className="flex flex-wrap gap-4">
            {uploadedTests.map((test) => (
              <div key={test.id} className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-white/10 shadow-sm">
                <img src={test.previewUrl} alt="Test preview" className="w-full h-full object-cover" />
                
                {test.isDuplicate && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg transform -rotate-12 border border-black/10">
                      DUPLICATE
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    triggerHaptic();
                    onRemove(test.id);
                  }}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>

                <div className="absolute bottom-1 right-1">
                  {test.status === 'analyzing' && (
                    <div className="bg-[#3b82f6] rounded-full p-1 shadow-md animate-pulse">
                      <Loader2 size={16} className="text-white animate-spin" />
                    </div>
                  )}
                  {test.status === 'success' && (
                    <div className="bg-green-500 rounded-full p-1 shadow-md">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                  {test.status === 'error' && (
                    <div className="bg-gray-500 rounded-full p-1 shadow-md" title={test.errorMessage}>
                      <X size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3 relative z-10">
          <Loader2 size={32} className="text-[#3b82f6] animate-spin" />
          <p className="text-[#3b82f6] font-medium">Analyzing test with AI...</p>
        </div>
      )}
    </div>
  );
}
