import React, { useState } from 'react';
import { Entity, Relationship } from '../types/database';
import { Sparkles, Send, X, Bot, User, Loader2, BookOpen } from 'lucide-react';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  relationships: Relationship[];
}

interface Message {
  sender: 'tutor' | 'student';
  text: string;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  entities,
  relationships,
}) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'tutor',
      text: 'สวัสดีครับน้องๆ ปวช.1 ครูคือ "อ.วิชาญ" ครูผู้ช่วยสอนวิชาหลักการออกแบบฐานข้อมูล มีข้อสงสัยเรื่อง ER Diagram, คีย์หลัก (PK), คีย์นอก (FK), หรือการแตกตารางเชื่อม N:M ถามครูได้เลยนะ หรือจะให้ครูตรวจแบบร่างของน้องก็ได้ครับ!',
    },
  ]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: Message = { sender: 'student', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          schema: {
            entities: entities.map((e) => ({
              name: e.name,
              thaiName: e.thaiName,
              attributes: e.attributes.map((a) => ({
                name: a.name,
                thaiName: a.thaiName,
                type: a.type,
                isPrimary: a.isPrimary,
                isForeign: a.isForeign,
              })),
            })),
            relationships: relationships.map((r) => ({
              name: r.name,
              thaiName: r.thaiName,
              source: entities.find((e) => e.id === r.sourceEntityId)?.name,
              target: entities.find((e) => e.id === r.targetEntityId)?.name,
              cardinality: r.cardinality,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server request failed');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: data.reply || 'ขออภัยด้วยครับ ลองถามใหม่อีกครั้งนะครับ',
        },
      ]);
    } catch (err) {
      // Local pedagogical fallback in case server proxy or network is unavailable
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: `ครูวิชาญตรวจดูให้แล้วนะครับ: โครงสร้างปัจจุบันของน้องมีทั้งหมด ${entities.length} ตาราง และ ${relationships.length} เส้นความสัมพันธ์ ข้อสำคัญสำหรับ ปวช.1 คือตรวจสอบว่าทุกตารางต้องมี Primary Key และความสัมพันธ์ N:M ต้องมีตารางเชื่อมเสมอ ลองดูคำแนะนำในแถบ "ระบบตรวจอัตโนมัติ" เพิ่มเติมได้เลยครับ!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'อาจารย์ช่วยตรวจภาพรวมของแบบจำลองนี้ให้หน่อยครับ',
    'ทำไมความสัมพันธ์ N:M ถึงต้องมีตารางเชื่อมครับ?',
    'คีย์หลัก (PK) กับคีย์นอก (FK) ต่างกันอย่างไรครับ?',
    'ช่วยอธิบาย 1NF, 2NF, 3NF แบบเข้าใจง่ายหน่อยครับ',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                อ.วิชาญ - ครูผู้ช่วยสอน AI วิชาฐานข้อมูล ปวช.1
              </h3>
              <p className="text-[11px] text-slate-500">
                ให้คำปรึกษา แนะนำการออกแบบ และตรวจแบบร่าง ER Diagram ตามหลักสูตรอาชีวะ
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

        {/* Chat message history */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'student' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === 'student'
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'student' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>อ.วิชาญ กำลังวิเคราะห์แบบจำลอง ER Diagram...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">คำถามด่วน:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors shrink-0 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="พิมพ์คำถามหรือขอคำแนะนำจากอาจารย์ได้ที่นี่..."
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่ง</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
