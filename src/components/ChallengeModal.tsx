import React from 'react';
import { Challenge, SchemaProject } from '../types/database';
import { CHALLENGES } from '../data/templates';
import { Award, CheckCircle2, Play, Star, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadChallenge: (challenge: Challenge) => void;
  activeChallengeId: string | null;
  currentScore: number;
  currentErrorCount: number;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onLoadChallenge,
  activeChallengeId,
  currentScore,
  currentErrorCount,
}) => {
  if (!isOpen) return null;

  const activeChallenge = CHALLENGES.find((c) => c.id === activeChallengeId);
  const isTargetMet =
    activeChallenge &&
    (!activeChallenge.targetCriteria.noErrors || currentErrorCount === 0) &&
    currentScore >= activeChallenge.targetCriteria.minScore;

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                แบบฝึกหัดท้าทายวิชาฐานข้อมูล ปวช.1
              </h3>
              <p className="text-xs text-slate-500">
                ฝึกฝนทักษะการค้นหาข้อผิดพลาดและออกแบบความสัมพันธ์ใน ER Diagram ให้ถูกต้องตามหลักสูตร
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ปิด
          </button>
        </div>

        {/* Active Challenge Status Banner if one is active */}
        {activeChallenge && (
          <div className="px-6 py-3.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900">
                กำลังทำภารกิจ: {activeChallenge.title}
              </span>
              {isTargetMet ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านภารกิจแล้ว (100%)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  ยังเหลือข้อผิดพลาด ({currentErrorCount} จุด, คะแนน {currentScore}/100)
                </span>
              )}
            </div>

            {isTargetMet && (
              <button
                onClick={handleCelebrate}
                className="text-xs px-3 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                🎉 จุดพลุฉลองความสำเร็จ!
              </button>
            )}
          </div>
        )}

        {/* Challenges List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {CHALLENGES.map((challenge, index) => {
            const isActive = activeChallengeId === challenge.id;

            return (
              <div
                key={challenge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {challenge.title}
                      </span>
                      <span className="flex items-center text-amber-500 text-[10px]">
                        {Array.from({ length: challenge.levelNum }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        ระดับ: {challenge.level}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {challenge.description}
                    </p>

                    <div className="mt-2 text-[11px] text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                      <span className="font-semibold">🎯 เป้าหมายภารกิจ: </span>
                      {challenge.objective}
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    <button
                      onClick={() => {
                        onLoadChallenge(challenge);
                        onClose();
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                        isActive
                          ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? 'กำลังทำภารกิจนี้' : 'เริ่มทำภารกิจ'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
