import React, { useState } from 'react';
import { BookOpen, X, Key, Link2, Table, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import heroImg from '../assets/images/db_er_modeler_hero_1790556392107.jpg';

interface VocationalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VocationalGuideModal: React.FC<VocationalGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState<'concepts' | 'relationships' | 'normalization' | 'notations'>('concepts');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                คู่มือการออกแบบฐานข้อมูลและ ER Diagram สำหรับ ปวช.1
              </h3>
              <p className="text-xs text-slate-500">
                รวมความรู้พื้นฐาน, กฎความสัมพันธ์, ตารางเชื่อมโยง, และการจัดทำบรรทัดฐานข้อมูล (Normalization)
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

        {/* Hero banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={heroImg}
            alt="Database ER Diagram Blueprint"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
            <span className="text-xs font-semibold text-indigo-300">
              วิชาหลักการออกแบบและจัดการฐานข้อมูล (Database Management)
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              คู่มือเตรียมความพร้อมนักเรียนอาชีวศึกษา ระดับ ปวช.
            </h2>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSection('concepts')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'concepts'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. คำศัพท์พื้นฐาน (Entity, PK, FK)
          </button>
          <button
            onClick={() => setActiveSection('relationships')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'relationships'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. กฎความสัมพันธ์ 1:1, 1:N, N:M
          </button>
          <button
            onClick={() => setActiveSection('normalization')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'normalization'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. กฎ Normalization (1NF, 2NF, 3NF)
          </button>
          <button
            onClick={() => setActiveSection('notations')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeSection === 'notations'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. สัญลักษณ์ Crow's Foot vs Chen
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {activeSection === 'concepts' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-600" /> เอนทิตี (Entity) คืออะไร?
                </h4>
                <p>
                  เอนทิตีคือสิ่งของ บุคคล สถานที่ หรือแนวคิดในโลกความเป็นจริงที่เราสนใจเก็บข้อมูล
                  ในระบบเชิงสัมพันธ์ เอนทิตีจะถูกแปลงไปเป็น <strong>"ตาราง" (Table)</strong> เช่น นักเรียน
                  (students), สินค้า (products), ใบเสร็จ (orders)
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 text-sm mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" /> คีย์หลัก (Primary Key - PK)
                </h4>
                <p>
                  คือคอลัมน์ที่ใช้ระบุ <strong>เอกลักษณ์เฉพาะของแต่ละแถวข้อมูล</strong> โดยมีกฎเหล็ก 2 ข้อ:
                  <br />
                  1. ห้ามมีค่าซ้ำกันเด็ดขาด (Unique)
                  <br />
                  2. ห้ามเป็นค่าว่าง (NOT NULL)
                  <br />
                  ตัวอย่าง: <code>student_id</code> (รหัสนักเรียน), <code>product_id</code> (บาร์โค้ดสินค้า)
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-950 text-sm mb-1 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-600" /> คีย์นอก (Foreign Key - FK)
                </h4>
                <p>
                  คือคอลัมน์ในตารางหนึ่งที่ <strong>ชี้อ้างอิงไปยัง Primary Key ของอีกตารางหนึ่ง</strong> เพื่อสร้างความเชื่อมโยง
                  โดยกฎคือ: <em>คีย์นอกต้องถูกนำไปใส่ไว้ในตารางฝั่ง Many (N) เสมอ!</em>
                  <br />
                  ตัวอย่าง: ในตาราง <code>students</code> มีคอลัมน์ <code>dept_id</code> เพื่อบอกว่านักเรียนคนนี้สังกัดแผนกใด
                </p>
              </div>
            </div>
          )}

          {activeSection === 'relationships' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">1 : 1 (One-to-One)</span>
                  <p className="text-[11px] text-slate-600">
                    ข้อมูล 1 แถวในตาราง A สัมพันธ์กับ 1 แถวในตาราง B เท่านั้น เช่น
                    <strong> 1 นักเรียน มี 1 บัตรประจำตัวประชาชน</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="font-bold text-indigo-900 block mb-1">1 : N (One-to-Many)</span>
                  <p className="text-[11px] text-slate-600">
                    ข้อมูล 1 แถวในตาราง A สัมพันธ์กับได้หลายแถวในตาราง B เช่น
                    <strong> 1 แผนกวิชา มีนักเรียนได้หลายคน</strong> (เป็นรูปแบบที่พบบ่อยที่สุดในระบบ)
                  </p>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="font-bold text-rose-900 block mb-1">N : M (Many-to-Many)</span>
                  <p className="text-[11px] text-slate-600">
                    นักเรียนหลายคน ลงเรียนได้หลายวิชา และแต่ละวิชาก็มีนักเรียนหลายคน
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300">
                <h4 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> ทำไม N:M ถึงสร้างตารางใน SQL ไม่ได้?
                </h4>
                <p className="text-amber-950 mt-1">
                  เพราะในฐานข้อมูลเชิงสัมพันธ์ แต่ละช่อง (Cell) ต้องเก็บค่าได้เพียงค่าเดียว (Atomic Value)
                  หากเราพยายามเก็บรหัสวิชาหลายๆ ตัวลงในแถวนักเรียนคนเดียว เช่น <code>วิชา: "20101, 20102, 20103"</code>
                  จะทำให้ค้นหาข้อมูลไม่ได้ จัดเรียงไม่ได้ และผิดหลัก 1NF ทันที!
                  <br /><br />
                  <strong>วิธีแก้ที่ถูกต้อง:</strong> สร้าง <strong>"ตารางเชื่อม" (Junction Table)</strong> เช่น <code>enrollments</code>
                  โดยนำ Primary Key ของทั้งสองฝั่งมาใส่ไว้เป็น Foreign Key
                </p>
              </div>
            </div>
          )}

          {activeSection === 'normalization' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">1NF (First Normal Form)</h4>
                <p>
                  ทุกช่องในตารางต้องเป็น <strong>ค่าเดี่ยว (Atomic Value)</strong> ไม่มีข้อมูลซ้ำซ้อนเป็นกลุ่ม (No Repeating Groups)
                  และทุกแถวต้องระบุเอกลักษณ์ได้ด้วย Primary Key
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">2NF (Second Normal Form)</h4>
                <p>
                  ต้องผ่าน 1NF ก่อน และ <strong>ทุกคอลัมน์ที่ไม่ใช่คีย์ ต้องขึ้นตรงกับ Primary Key ทั้งก้อน</strong>
                  (ห้ามขึ้นกับส่วนใดส่วนหนึ่งของ Composite Key เรียกว่า No Partial Dependency)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">3NF (Third Normal Form)</h4>
                <p>
                  ต้องผ่าน 2NF ก่อน และ <strong>ห้ามมีคอลัมน์ที่ไม่ใช่คีย์ ไปขึ้นต่อกันเอง</strong> (No Transitive Dependency)
                  ตัวอย่าง: ในตารางนักเรียน ไม่ควรเก็บ <code>department_name</code> และ <code>head_of_department</code>
                  ให้เก็บเพียง <code>dept_id</code> แล้วแยกชื่อแผนกไปไว้ที่ตาราง <code>departments</code>
                </p>
              </div>
            </div>
          )}

          {activeSection === 'notations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                  <h4 className="font-bold text-indigo-900 text-sm mb-1">Crow's Foot Notation</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>ใช้รูปตารางสี่เหลี่ยม แบ่งส่วนหัวตารางและรายชื่อคอลัมน์</li>
                    <li>ใช้สัญลักษณ์ตีนกา (Trident <code>&gt;</code>) บ่งบอกฝั่ง Many (N)</li>
                    <li>ใช้เส้นขีดคู่ <code>||</code> บ่งบอกฝั่ง One และ Mandatory</li>
                    <li>นิยมใช้มากที่สุดในอุตสาหกรรมซอฟต์แวร์จริง</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-900 text-sm mb-1">Chen Notation</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>สี่เหลี่ยมผืนผ้า = เอนทิตี (Entity)</li>
                    <li>รูปวงรี = แอตทริบิวต์ (Attribute) โดยขีดเส้นใต้ที่ Primary Key</li>
                    <li>รูปข้าวหลามตัด = ความสัมพันธ์ (Relationship) พร้อมเขียนตัวเลข 1, N, M บนเส้น</li>
                    <li>เป็นมาตรฐานเชิงทฤษฎีในตำราเรียน</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
