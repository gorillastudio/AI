import React from 'react';
import { StudentTest } from '../types';
import { ArrowLeft, Download } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface Props {
  studentCount: number;
  uploadedTests: StudentTest[];
  onBack: () => void;
}

export function Results({ studentCount, uploadedTests, onBack }: Props) {
  const scoredTests = uploadedTests.filter((t) => t.status === 'success' && t.studentNumber !== undefined);
  
  // Create a map of student number to score and duplicate status
  const studentDataMap = new Map<number, { score: number, hasDuplicate: boolean }>();
  scoredTests.forEach((t) => {
    if (t.studentNumber !== undefined && t.score !== undefined) {
      const existing = studentDataMap.get(t.studentNumber);
      if (existing) {
        studentDataMap.set(t.studentNumber, { score: t.score, hasDuplicate: true });
      } else {
        studentDataMap.set(t.studentNumber, { score: t.score, hasDuplicate: !!t.isDuplicate });
      }
    }
  });

  const handleDownload = async () => {
    let csvContent = "Number of student,Score\n";

    for (let i = 1; i <= studentCount; i++) {
      const data = studentDataMap.get(i);
      const score = data ? data.score : "-";
      csvContent += `${i},${score}\n`;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `test_results.csv`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: 'Test Results',
          text: 'Here are the test results',
          url: result.uri,
          dialogTitle: 'Save or Share Results',
        });
      } catch (error) {
        console.error('Error sharing file:', error);
      }
    } else {
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "test_results.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 pt-4">
        <button onClick={() => {
          triggerHaptic();
          onBack();
        }} className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all duration-300 text-white border border-white/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Results</h1>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Test Results</h2>
        <p className="text-gray-400 text-sm">
          {studentDataMap.size}/{studentCount} students scored
        </p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mb-24 transition-all duration-300">
        <table className="w-full text-left relative z-10">
          <thead className="bg-white/5 border-b border-white/10 text-white backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-bold">Number</th>
              <th className="px-6 py-4 font-bold">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {[...Array(studentCount)].map((_, i) => {
              const num = i + 1;
              const data = studentDataMap.get(num);
              return (
                <tr key={num} className="hover:bg-white/5 transition-colors backdrop-blur-sm">
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    {num}
                    {data?.hasDuplicate && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Duplicate test detected" />
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{data ? data.score : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="h-24" /> {/* Spacer to prevent content from being hidden behind fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 transition-colors duration-300 z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => {
              triggerHaptic();
              handleDownload();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#107c41] hover:bg-[#0e6b38] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#107c41]/30 border border-white/10"
          >
            <Download size={24} />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}
