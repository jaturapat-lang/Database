import React from 'react';
import { SchemaProject } from '../types/database';
import { TEMPLATES } from '../data/templates';
import { FolderDown, Check, GraduationCap, ShoppingBag, Wrench, X } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SchemaProject) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const templateIcons: Record<string, React.ReactNode> = {
    college_enrollment: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    coop_store: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
    workshop_tools: <Wrench className="w-5 h-5 text-amber-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FolderDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                เลือกเทมเพลตตัวอย่าง ปวช.1
              </h3>
              <p className="text-xs text-slate-500">
                โหลดแบบจำลอง ER Diagram จากสถานการณ์จริงในวิทยาลัยอาชีวศึกษา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-3">
          {Object.entries(TEMPLATES).map(([key, template]) => (
            <div
              key={key}
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-white border border-slate-200 shrink-0">
                {templateIcons[key] || <FolderDown className="w-5 h-5 text-indigo-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {template.entities.length} ตาราง · {template.relationships.length} ความสัมพันธ์
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
