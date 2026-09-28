import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK on server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Vocational Teacher AI Tutor API endpoint
app.post('/api/gemini/tutor', async (req: Request, res: Response) => {
  try {
    const { question, schema } = req.body;

    const isDummyKey = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '';

    if (isDummyKey || !ai) {
      return res.json({
        reply: `อ.วิชาญ แนะนำ: สวัสดีครับน้องๆ ปวช.1 จากที่ครูตรวจดูข้อมูลและคำถาม "${question}":
1. หัวใจสำคัญของ ER Diagram คือ "ความสัมพันธ์ (Relationship)" โดยเฉพาะในโมเดล Relational ห้ามเชื่อม N:M โดยตรง ต้องมีตารางเชื่อม (Junction Table) เสมอ
2. ทุกตารางจำเป็นต้องมีคีย์หลัก (Primary Key: PK) เพื่อเป็นตัวชี้วัดเอกลักษณ์ข้อมูล เช่น student_id
3. ในตารางฝั่ง Many (N) ต้องมีคีย์นอก (Foreign Key: FK) เสมอ เพื่อเชื่อมโยงไปยังคีย์หลักฝั่ง One (1)
ลองกดดูระบบตรวจอัตโนมัติหรือดูที่คู่มือ ปวช.1 เพิ่มเติมได้เลยนะครับ เก่งมากครับที่สงสัยและตั้งคำถาม!`,
      });
    }

    const prompt = `คุณคือ "อ.วิชาญ" ครูผู้สอนวิชาหลักการออกแบบและจัดการฐานข้อมูล (Database Systems) สำหรับนักเรียนระดับ ปวช.1 (ประกาศนียบัตรวิชาชีพ ชั้นปีที่ 1)
บุคลิกภาพ: อบอุ่น ใจดี ให้กำลังใจ ใช้ภาษาไทยที่เข้าใจง่าย มีตัวอย่างประกอบ ไม่ใช้คำศัพท์เทคนิคที่ยากเกินไปโดยไม่อธิบาย

ข้อมูลโครงสร้าง ER Diagram และตารางของนักเรียนปัจจุบัน:
${JSON.stringify(schema, null, 2)}

คำถามหรือข้อสงสัยของนักเรียน:
"${question}"

โปรดตอบคำถามหรือให้คำแนะนำในการปรับปรุง ER Diagram:
1. ชมเชยจุดที่ทำได้ดี
2. ชี้แนะจุดบกพร่องที่ต้องระวัง (เช่น ขาด Primary Key, ความสัมพันธ์ Many-to-Many ที่ต้องทำตารางเชื่อม, การสะกดชื่อ Foreign Key, หรือ Normalization)
3. ยกตัวอย่างที่จับต้องได้ในชีวิตประจำวัน เช่น ระบบร้านค้าสหกรณ์ หรือ ระบบทะเบียนวิทยาลัย`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert vocational teacher in Thailand teaching vocational students (ปวช.1) about Database Modeling, ER Diagrams, Normalization, and Multi-model databases.',
      },
    });

    const replyText = response.text || 'อาจารย์ได้รับคำถามแล้วครับ ลองทบทวนความสัมพันธ์ N:M และคีย์หลักดูนะครับ';
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.json({
      reply: `อ.วิชาญ แนะนำ: สำหรับคำถาม "${req.body.question || 'เรื่องฐานข้อมูล'}" ขอแนะนำหลักการสำคัญสำหรับ ปวช.1 คือ:
1. การตรวจสอบว่าทุกเอนทิตีมีคีย์หลัก (Primary Key) ที่ไม่ซ้ำกัน
2. การแปลงความสัมพันธ์ Many-to-Many (N:M) ให้เป็นตารางเชื่อมโยง (Junction Table) เสมอในระบบ Relational (SQL)
3. ตรวจสอบชนิดข้อมูลของคีย์นอก (Foreign Key) ให้ตรงกับคีย์หลักปลายทาง เช่น INT กับ INT
สามารถตรวจสอบจุดบกพร่องแบบเรียลไทม์ได้ที่แท็บ "ระบบตรวจอัตโนมัติ" ได้เลยครับ!`,
    });
  }
});

// Setup Vite in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
