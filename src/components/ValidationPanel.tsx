import React, { useState } from 'react';
import {
  ValidationIssue,
  RubricScore,
  DatabaseModelType,
  Entity,
  Relationship,
} from '../types/database';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Wrench,
  Award,
  BookOpen,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  rubric: RubricScore;
  currentModel: DatabaseModelType;
  setCurrentModel: (model: DatabaseModelType) => void;
  onApplyFix: (issue: ValidationIssue) => void;
  entities: Entity[];
  relationships: Relationship[];
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  rubric,
  currentModel,
  setCurrentModel,
  onApplyFix,
  entities,
  relationships,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;
  const successCount = issues.filter((i) => i.severity === 'success').length;

  const filteredIssues = issues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'B+':
      case 'B':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'C+':
      case 'C':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      default:
        return 'text-rose-700 bg-rose-100 border-rose-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Banner: Model Selector Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              ระบบตรวจสอบความถูกต้องของความสัมพันธ์ในแต่ละโมเดลอัตโนมัติ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กฎการตรวจสอบจะปรับเปลี่ยนตามกระบวนทัศน์ของฐานข้อมูลที่คุณเลือก (เช่น RDBMS ห้าม N:M แต่ Graph ยอมรับได้)
          </p>
        </div>

        {/* Model Switcher Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
          {(
            [
              { id: 'relational', label: '1. Relational (SQL)' },
              { id: 'document', label: '2. Document (NoSQL)' },
              { id: 'graph', label: '3. Graph (Neo4j)' },
              { id: 'keyvalue', label: '4. Key-Value (Redis)' },
              { id: 'star_schema', label: '5. Star Schema (DW)' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setCurrentModel(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentModel === m.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Rubric Score Summary & Teacher Commentary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Grade Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                เกณฑ์การประเมินทักษะ ปวช.1
              </span>
              <span
                className={`text-sm font-extrabold px-3 py-0.5 rounded-full border ${getGradeColor(
                  rubric.grade
                )}`}
              >
                เกรด {rubric.grade}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                {rubric.totalScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100 คะแนนเต็ม</span>
            </div>

            {/* 4 Rubric Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>1. โครงสร้างตาราง (Table Structure)</span>
                  <span className="font-mono tabular-nums">{rubric.tableStructureScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(rubric.tableStructureScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>2. คีย์หลักและคีย์นอก (PK & FK Design)</span>
                  <span className="font-mono tabular-nums">{rubric.keyDesignScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(rubric.keyDesignScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>3. ความสัมพันธ์ถูกต้องตามโมเดล (Cardinality)</span>
                  <span className="font-mono tabular-nums">{rubric.relationshipModelScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(rubric.relationshipModelScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>4. มาตรฐานและความสมบูรณ์ (Integrity)</span>
                  <span className="font-mono tabular-nums">{rubric.normalizationIntegrityScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(rubric.normalizationIntegrityScore / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>จำนวนตาราง: {entities.length} ตาราง</span>
            <span>ความสัมพันธ์: {relationships.length} เส้น</span>
          </div>
        </div>

        {/* Teacher Commentary Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/70 via-white to-white rounded-2xl p-5 border border-indigo-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ข้อเสนอแนะการประเมินจากอาจารย์ผู้สอนประจำแผนก
                </h3>
                <span className="text-[11px] text-slate-500">
                  หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.1) สาขาเทคโนโลยีสารสนเทศและคอมพิวเตอร์ธุรกิจ
                </span>
              </div>
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-xs rounded-xl border border-indigo-100 text-xs leading-relaxed text-slate-800">
              {rubric.teacherComment}
            </div>

            {/* Quick Tips Box */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ข้อควรระวัง N:M
                </span>
                ในโมเดล Relational ห้ามมีเส้น N:M โดยตรง ให้กดปุ่ม "⚡ แก้ปัญหาอัตโนมัติ"
                เพื่อสร้างตารางเชื่อม
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-blue-900">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" /> คีย์นอก (Foreign Key)
                </span>
                ตารางฝั่ง Many (N) ต้องมีคอลัมน์คีย์นอกชี้ไปยังคีย์หลักของตารางฝั่ง One (1) เสมอ
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>สถานะระบบ: วิเคราะห์แบบเรียลไทม์ 100%</span>
            <span className="font-medium text-indigo-600">
              โมเดลที่เลือก: {currentModel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Diagnostic Issues */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            รายการตรวจวินิจฉัย ({filteredIssues.length} รายการ)
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1 font-medium rounded-lg transition-colors ${
              filterSeverity === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({issues.length})
          </button>
          <button
            onClick={() => setFilterSeverity('error')}
            className={`px-3 py-1 font-medium rounded-lg transition-colors flex items-center gap-1 ${
              filterSeverity === 'error'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            ข้อผิดพลาด ({errorCount})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1 font-medium rounded-lg transition-colors flex items-center gap-1 ${
              filterSeverity === 'warning'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            คำเตือน ({warningCount})
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`px-3 py-1 font-medium rounded-lg transition-colors flex items-center gap-1 ${
              filterSeverity === 'info'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            คำแนะนำ ({infoCount})
          </button>
        </div>
      </div>

      {/* Issues Cards List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            ไม่มีรายการตรวจสอบในหมวดหมู่นี้
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isError = issue.severity === 'error';
            const isWarning = issue.severity === 'warning';
            const isSuccess = issue.severity === 'success';

            return (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border transition-all ${
                  isError
                    ? 'bg-rose-50/50 border-rose-200'
                    : isWarning
                    ? 'bg-amber-50/50 border-amber-200'
                    : isSuccess
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                      {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {!isError && !isWarning && !isSuccess && (
                        <Info className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{issue.title}</h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          [{issue.ruleId}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{issue.message}</p>

                      {/* Pedagogy callout */}
                      <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="font-semibold text-slate-900">💡 คำอธิบายเชิงวิชาการ: </span>
                        {issue.pedagogyTip}
                      </div>
                    </div>
                  </div>

                  {/* Auto-fix Action Button */}
                  {issue.autoFixable && issue.fixActionLabel && (
                    <div className="shrink-0 sm:self-center">
                      <button
                        onClick={() => onApplyFix(issue)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{issue.fixActionLabel}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
