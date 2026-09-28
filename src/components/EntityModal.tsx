import React, { useState } from 'react';
import { Entity, Attribute, DataType } from '../types/database';
import { X, Plus, Trash2, Key, Check } from 'lucide-react';

interface EntityModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entity: Entity) => void;
}

const DATA_TYPES: DataType[] = ['INT', 'VARCHAR', 'TEXT', 'DATE', 'DECIMAL', 'BOOLEAN'];
const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#0284c7', // Sky
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Rose
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#475569', // Slate
];

export const EntityModal: React.FC<EntityModalProps> = ({
  entity,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>(entity?.name || '');
  const [thaiName, setThaiName] = useState<string>(entity?.thaiName || '');
  const [color, setColor] = useState<string>(entity?.color || '#4f46e5');
  const [notes, setNotes] = useState<string>(entity?.notes || '');
  const [attributes, setAttributes] = useState<Attribute[]>(
    entity?.attributes || [
      {
        id: `att_${Date.now()}`,
        name: 'id',
        thaiName: 'รหัสเอกลักษณ์',
        type: 'INT',
        isPrimary: true,
        isForeign: false,
        isNullable: false,
      },
    ]
  );

  const handleAddAttribute = () => {
    const newAttr: Attribute = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      thaiName: '',
      type: 'VARCHAR',
      lengthOrPrecision: '100',
      isPrimary: false,
      isForeign: false,
      isNullable: true,
    };
    setAttributes([...attributes, newAttr]);
  };

  const handleUpdateAttribute = (id: string, updates: Partial<Attribute>) => {
    setAttributes(
      attributes.map((att) => (att.id === id ? { ...att, ...updates } : att))
    );
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attributes.filter((att) => att.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedEntity: Entity = {
      id: entity?.id || `ent_${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '_'),
      thaiName: thaiName.trim() || name.trim(),
      color,
      notes,
      x: entity?.x ?? 150,
      y: entity?.y ?? 150,
      attributes: attributes.filter((a) => a.name.trim() !== ''),
    };

    onSave(updatedEntity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {entity ? 'แก้ไขเอนทิตี / ตาราง' : 'สร้างเอนทิตี / ตารางใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดชื่อตาราง ภาษาไทย และคอลัมน์ (แอตทริบิวต์) สำหรับระบบฐานข้อมูล
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อตาราง (ภาษาอังกฤษ สำหรับ SQL) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น students, orders, products"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อภาษาไทย (คำอธิบาย)
              </label>
              <input
                type="text"
                value={thaiName}
                onChange={(e) => setThaiName(e.target.value)}
                placeholder="เช่น นักเรียน, คำสั่งซื้อ, สินค้า"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              สีประจำตาราง
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Attributes List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  รายการคอลัมน์ (แอตทริบิวต์)
                </label>
                <span className="text-[11px] text-slate-500">
                  ต้องมีอย่างน้อย 1 คอลัมน์ที่เป็น Primary Key (PK)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มคอลัมน์</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                <span className="col-span-3">ชื่อคอลัมน์ (SQL)</span>
                <span className="col-span-3">ชื่อภาษาไทย</span>
                <span className="col-span-2">ชนิดข้อมูล</span>
                <span className="col-span-1 text-center" title="Primary Key">PK</span>
                <span className="col-span-1 text-center" title="Foreign Key">FK</span>
                <span className="col-span-1 text-center" title="อนุญาตให้ว่างได้">Null</span>
                <span className="col-span-1 text-right">ลบ</span>
              </div>

              {attributes.map((att) => (
                <div key={att.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-white hover:bg-slate-50/50">
                  {/* Name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={att.name}
                      onChange={(e) => handleUpdateAttribute(att.id, { name: e.target.value })}
                      placeholder="column_name"
                      className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Thai Name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={att.thaiName || ''}
                      onChange={(e) => handleUpdateAttribute(att.id, { thaiName: e.target.value })}
                      placeholder="เช่น รหัสสินค้า"
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <select
                      value={att.type}
                      onChange={(e) => handleUpdateAttribute(att.id, { type: e.target.value as DataType })}
                      className="w-full px-1.5 py-1 text-xs font-mono border border-slate-200 rounded bg-white"
                    >
                      {DATA_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PK Toggle */}
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      checked={att.isPrimary}
                      onChange={(e) =>
                        handleUpdateAttribute(att.id, {
                          isPrimary: e.target.checked,
                          isNullable: e.target.checked ? false : att.isNullable,
                        })
                      }
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* FK Toggle */}
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      checked={att.isForeign}
                      onChange={(e) => handleUpdateAttribute(att.id, { isForeign: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Nullable Toggle */}
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      checked={att.isNullable}
                      disabled={att.isPrimary}
                      onChange={(e) => handleUpdateAttribute(att.id, { isNullable: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteAttribute(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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
              บันทึกข้อมูลตาราง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
