import React, { useState } from 'react';
import { Relationship, Entity, Cardinality, Participation } from '../types/database';
import { X, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';

interface RelationshipModalProps {
  relationship: Relationship | null;
  entities: Entity[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (rel: Relationship) => void;
  onDelete: (id: string) => void;
  initialSourceId?: string;
  initialTargetId?: string;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  relationship,
  entities,
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSourceId,
  initialTargetId,
}) => {
  if (!isOpen) return null;

  const [sourceEntityId, setSourceEntityId] = useState<string>(
    relationship?.sourceEntityId || initialSourceId || entities[0]?.id || ''
  );
  const [targetEntityId, setTargetEntityId] = useState<string>(
    relationship?.targetEntityId || initialTargetId || entities[1]?.id || entities[0]?.id || ''
  );
  const [name, setName] = useState<string>(relationship?.name || 'related_to');
  const [thaiName, setThaiName] = useState<string>(relationship?.thaiName || 'มีความสัมพันธ์กับ');
  const [cardinality, setCardinality] = useState<Cardinality>(
    relationship?.cardinality || '1:N'
  );
  const [sourceParticipation, setSourceParticipation] = useState<Participation>(
    relationship?.sourceParticipation || 'mandatory'
  );
  const [targetParticipation, setTargetParticipation] = useState<Participation>(
    relationship?.targetParticipation || 'mandatory'
  );

  const sourceEntity = entities.find((e) => e.id === sourceEntityId);
  const targetEntity = entities.find((e) => e.id === targetEntityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceEntityId || !targetEntityId) return;

    const newRel: Relationship = {
      id: relationship?.id || `rel_${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '_') || 'related_to',
      thaiName: thaiName.trim() || 'สัมพันธ์กับ',
      sourceEntityId,
      targetEntityId,
      cardinality,
      sourceParticipation,
      targetParticipation,
    };

    onSave(newRel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {relationship ? 'แก้ไขความสัมพันธ์ (Relationship)' : 'กำหนดความสัมพันธ์ใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดประเภทความสัมพันธ์และ Cardinality (1:1, 1:N, N:M)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Entity Linkage Visual */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-[45%]">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ตารางต้นทาง (Source)
              </label>
              <select
                value={sourceEntityId}
                onChange={(e) => setSourceEntityId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
              >
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.thaiName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-mono font-bold text-indigo-700 mt-0.5">
                {cardinality}
              </span>
            </div>

            <div className="w-[45%]">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ตารางปลายทาง (Target)
              </label>
              <select
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
              >
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.thaiName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Relationship Cardinality Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ระดับความสัมพันธ์ (Cardinality) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCardinality('1:1')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  cardinality === '1:1'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 mb-0.5">1 : 1 (One-to-One)</div>
                <div className="text-[11px] text-slate-500">
                  หนึ่งต่อหนึ่ง (เช่น นักเรียน 1 คนมี 1 รหัสบัตรประชาชน)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCardinality('1:N')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  cardinality === '1:N'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 mb-0.5">1 : N (One-to-Many)</div>
                <div className="text-[11px] text-slate-500">
                  หนึ่งต่อกลุ่ม (เช่น 1 แผนกวิชามีนักเรียนได้หลายคน)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCardinality('N:M')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  cardinality === 'N:M'
                    ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 mb-0.5">N : M (Many-to-Many)</div>
                <div className="text-[11px] text-slate-500">
                  กลุ่มต่อกลุ่ม (เช่น นักเรียนหลายคนลงเรียนหลายวิชา)
                </div>
              </button>
            </div>
          </div>

          {/* Warning notice when N:M is chosen */}
          {cardinality === 'N:M' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">ข้อควรจำสำหรับนักเรียน ปวช.1:</span>
                <p className="mt-0.5 text-amber-800 text-[11px]">
                  ในฐานข้อมูลเชิงสัมพันธ์ (SQL) ไม่สามารถสร้างความสัมพันธ์แบบ N:M ได้โดยตรง
                  ระบบตรวจจะแนะนำให้คุณแปลงเป็น "ตารางเชื่อม" (Junction Table) เสมอ!
                </p>
              </div>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อความสัมพันธ์ (Verb / ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น enrolled_in, belongs_to"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คำอธิบายความสัมพันธ์ (ภาษาไทย)
              </label>
              <input
                type="text"
                value={thaiName}
                onChange={(e) => setThaiName(e.target.value)}
                placeholder="เช่น ลงทะเบียนเรียนใน, สังกัด"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {relationship ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(relationship.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบความสัมพันธ์นี้</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                บันทึกความสัมพันธ์
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
