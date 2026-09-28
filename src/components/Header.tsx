import React from 'react';
import { Database, Sparkles, BookOpen, Layers, CheckCircle2, Award, Plus, FolderDown } from 'lucide-react';

interface HeaderProps {
  activeTab: 'canvas' | 'validation' | 'multimodel' | 'challenges' | 'guide';
  setActiveTab: (tab: 'canvas' | 'validation' | 'multimodel' | 'challenges' | 'guide') => void;
  onNewEntity: () => void;
  onOpenTemplates: () => void;
  onOpenAiTutor: () => void;
  errorCount: number;
  totalScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewEntity,
  onOpenTemplates,
  onOpenAiTutor,
  errorCount,
  totalScore,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Database className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <button
            onClick={() => setActiveTab('canvas')}
            className="text-base font-bold tracking-tight text-slate-900 text-left hover:text-indigo-600 transition-colors"
          >
            SimuData Vocational ER
          </button>
          <span className="text-[11px] text-slate-500 font-normal">
            แบบจำลองฐานข้อมูลหลากโมเดลและระบบตรวจ ER Diagram ปวช.1
          </span>
        </div>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'canvas'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          ผืนผ้าใบ ER Diagram
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'validation'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ระบบตรวจอัตโนมัติ</span>
          {errorCount > 0 ? (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded-md">
              {errorCount} ข้อผิดพลาด
            </span>
          ) : (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-md">
              {totalScore} คะแนน
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('multimodel')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'multimodel'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          แบบจำลอง 5 โมเดล
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'challenges'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          แบบฝึกหัดท้าทาย
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          คู่มือ ปวช.1
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
        >
          <FolderDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">เทมเพลตตัวอย่าง</span>
        </button>

        <button
          onClick={onOpenAiTutor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-xs"
          title="ปรึกษาอาจารย์ผู้ช่วยสอน AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>ครูผู้ช่วยสอน AI</span>
        </button>

        <button
          onClick={onNewEntity}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มตาราง/Entity</span>
        </button>
      </div>
    </header>
  );
};
