import React, { useState } from 'react';
import { Entity, Relationship, DatabaseModelType } from '../types/database';
import {
  generateSQLDDL,
  generateDocumentModel,
  generateGraphCypher,
  generateKeyValueRedis,
  generateStarSchemaBI,
} from '../utils/modelGenerators';
import {
  Database,
  FileCode,
  Copy,
  Check,
  Share2,
  Table,
  Layers,
  Network,
  Zap,
  BarChart3,
  Lightbulb,
} from 'lucide-react';

interface MultiModelViewerProps {
  entities: Entity[];
  relationships: Relationship[];
  initialModel?: DatabaseModelType;
}

export const MultiModelViewer: React.FC<MultiModelViewerProps> = ({
  entities,
  relationships,
  initialModel = 'relational',
}) => {
  const [selectedModel, setSelectedModel] = useState<DatabaseModelType>(initialModel);
  const [copied, setCopied] = useState<boolean>(false);

  const getModelContent = (): { code: string; language: string; title: string; desc: string; concepts: string[] } => {
    switch (selectedModel) {
      case 'relational':
        return {
          code: generateSQLDDL(entities, relationships),
          language: 'sql',
          title: 'โมเดลเชิงสัมพันธ์ (Relational RDBMS / SQL)',
          desc: 'จัดเก็บข้อมูลเป็นตาราง (Tables) ประกอบด้วยแถวและคอลัมน์ เชื่อมโยงด้วย Primary Key (PK) และ Foreign Key (FK) ตามมาตรฐาน ANSI SQL',
          concepts: [
            'คีย์หลัก (PK) ระบุเอกลักษณ์ข้อมูลในแต่ละตาราง',
            'คีย์นอก (FK) เชื่อมโยงความสัมพันธ์ 1:N โดยเก็บไว้ในตารางฝั่ง N',
            'ความสัมพันธ์ N:M ต้องถูกแตกเป็น 1:N สองเส้นด้วยตารางเชื่อม (Junction Table)',
            'รองรับ ACID Transactions มีความน่าเชื่อถือของข้อมูลสูงสุด',
          ],
        };
      case 'document':
        return {
          code: generateDocumentModel(entities, relationships),
          language: 'json',
          title: 'โมเดลเชิงเอกสาร (Document / NoSQL - MongoDB)',
          desc: 'จัดเก็บข้อมูลในรูปแบบเอกสาร BSON/JSON ยืดหยุ่น ไม่จำเป็นต้องมี Schema คงที่ตายตัว สามารถฝังข้อมูลย่อย (Embedding) ลงในเอกสารแม่ได้ทันที',
          concepts: [
            'Embedding: ฝังข้อมูลลูกในเอกสารแม่เมื่อเป็นความสัมพันธ์ 1:1 หรือ 1:few ที่ดึงพร้อมกันเสมอ',
            'Referencing: ใช้อ้างอิง ObjectId เมื่อเป็นความสัมพันธ์ 1:Many ขนาดใหญ่ หรือข้อมูลที่เปลี่ยนแปลงบ่อย',
            'ไม่มีคำสั่ง JOIN ที่ซับซ้อน ช่วยให้อ่านข้อมูลก้อนใหญ่ได้เร็วมาก',
            'เหมาะสำหรับระบบแคตตาล็อกสินค้า, CMS, หรือแอปพลิเคชันมือถือ',
          ],
        };
      case 'graph':
        return {
          code: generateGraphCypher(entities, relationships),
          language: 'cypher',
          title: 'โมเดลเชิงกราฟ (Graph Database - Neo4j / Cypher)',
          desc: 'มองข้อมูลเป็นโหนด (Nodes) และเส้นเชื่อมความสัมพันธ์ที่มีทิศทาง (Directed Edges) เป็นพลเมืองชั้นหนึ่ง (First-Class Citizen)',
          concepts: [
            'ไม่ต้องใช้ตารางเชื่อม (Junction Table) สำหรับ N:M เพราะ Edge รองรับได้โดยธรรมชาติ',
            'สามารถกำหนด Properties บนเส้นความสัมพันธ์ได้ เช่น วันที่ลงทะเบียน, บทบาท',
            'สืบค้นเส้นทางความสัมพันธ์ลึกๆ (Traversal) ได้เร็วกว่า SQL JOIN หลายเท่า',
            'เหมาะสำหรับโซเชียลเน็ตเวิร์ก, ระบบแนะนำสินค้า (Recommendation), ระบบป้องกันการฉ้อโกง',
          ],
        };
      case 'keyvalue':
        return {
          code: generateKeyValueRedis(entities),
          language: 'redis',
          title: 'โมเดลคีย์-ค่า และแคช (Key-Value Store - Redis)',
          desc: 'จัดเก็บข้อมูลแบบคู่ Key-Value ในหน่วยความจำ RAM ความเร็วสูง นิยมใช้สำหรับระบบแคช (Cache), จัดการ Session, หรือระบบจองคิว',
          concepts: [
            'ใช้รูปแบบการตั้งชื่อคีย์แบบลำดับชั้น เช่น student:1001 หรือ order:5501:items',
            'ใช้ Redis Hashes (HSET/HGET) สำหรับข้อมูลแถวที่มีหลายฟิลด์',
            'ใช้ Redis Sets (SADD) สำหรับรวบรวมรายการรหัสที่สัมพันธ์กัน',
            'ความเร็วในการอ่านเขียนระดับไมโครวินาที (Sub-millisecond)',
          ],
        };
      case 'star_schema':
        return {
          code: generateStarSchemaBI(entities, relationships),
          language: 'markdown',
          title: 'โมเดลมิติข้อมูล Star Schema (Data Warehouse & BI)',
          desc: 'แบบจำลองโครงสร้างดาวสำหรับคลังข้อมูล (Data Warehouse) และระบบ Business Intelligence ออกแบบมาเพื่อการทำรายงานและสรุปข้อมูลสถิติขนาดใหญ่',
          concepts: [
            'Fact Table (ตารางข้อเท็จจริง) อยู่ตรงกลาง เก็บตัวเลขตัวชี้วัด (Measures เช่น ยอดเงิน, จำนวน, เกรดเฉลี่ย)',
            'Dimension Tables (ตารางมิติ) ล้อมรอบ ให้บริบทมุมมอง (ใคร, ที่ไหน, เมื่อไหร่, หมวดหมู่อะไร)',
            'ลดทอนความซับซ้อนของการ JOIN ทำให้โปรแกรมสร้าง Dashboard (เช่น Power BI, Tableau) ทำงานได้รวดเร็ว',
            'แยกออกจากฐานข้อมูลธุรกรรมประจำวัน (OLTP vs OLAP)',
          ],
        };
    }
  };

  const currentInfo = getModelContent();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentInfo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                แบบจำลองฐานข้อมูลที่หลากหลาย (Multi-Model Database Simulator)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              เรียนรู้ว่า ER Diagram เดียวกันนี้ สามารถแปลงและจัดเก็บในระบบฐานข้อมูล 5 รูปแบบที่แตกต่างกันได้อย่างไร
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>คัดลอกโค้ดสคริปต์</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Model Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-5">
          <button
            onClick={() => setSelectedModel('relational')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'relational'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Table className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">1. Relational (SQL)</span>
            </div>
            <span className="text-[11px] text-slate-500">ตาราง, PK/FK, ตารางเชื่อม</span>
          </button>

          <button
            onClick={() => setSelectedModel('document')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'document'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-900">2. Document (NoSQL)</span>
            </div>
            <span className="text-[11px] text-slate-500">JSON, Embed vs Reference</span>
          </button>

          <button
            onClick={() => setSelectedModel('graph')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'graph'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Network className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-900">3. Graph (Neo4j)</span>
            </div>
            <span className="text-[11px] text-slate-500">Nodes, Directed Edges, N:M</span>
          </button>

          <button
            onClick={() => setSelectedModel('keyvalue')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'keyvalue'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900">4. Key-Value (Redis)</span>
            </div>
            <span className="text-[11px] text-slate-500">แคช, Hashes, ชุดคีย์ด่วน</span>
          </button>

          <button
            onClick={() => setSelectedModel('star_schema')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedModel === 'star_schema'
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">5. Star Schema (DW)</span>
            </div>
            <span className="text-[11px] text-slate-500">Fact Table, Dimensions, BI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Code Inspector & Educational Conceptual Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Code Output Viewer (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-slate-400 ml-2">
                schema_output.{currentInfo.language}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>คัดลอก</span>
            </button>
          </div>

          <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto overflow-y-auto max-h-[560px] leading-relaxed selection:bg-indigo-600 selection:text-white">
            <code>{currentInfo.code}</code>
          </pre>
        </div>

        {/* Right: Educational Concept Card for ปวช.1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">{currentInfo.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{currentInfo.desc}</p>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                หลักการสำคัญที่นักเรียน ปวช.1 ต้องรู้:
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentInfo.concepts.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            💡 ทิปการเรียนรู้: เมื่อแก้ไขตารางหรือความสัมพันธ์ในผืนผ้าใบ ER Diagram
            โค้ดสคริปต์ของทั้ง 5 โมเดลนี้จะปรับปรุงตามทันทีแบบอัตโนมัติ!
          </div>
        </div>
      </div>
    </div>
  );
};
