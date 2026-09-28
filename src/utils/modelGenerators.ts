import { Entity, Relationship } from '../types/database';

export function generateSQLDDL(entities: Entity[], relationships: Relationship[]): string {
  if (entities.length === 0) return '-- ยังไม่มีเอนทิตีในระบบ กรุณาเพิ่มเอนทิตีบนผืนผ้าใบ ER Diagram';

  let sql = `-- ========================================================\n`;
  sql += `-- สคริปต์สร้างฐานข้อมูลเชิงสัมพันธ์ (Relational SQL DDL)\n`;
  sql += `-- สำหรับนักเรียน ปวช.1 วิชาหลักการออกแบบและจัดการฐานข้อมูล\n`;
  sql += `-- วันที่สร้าง: ${new Date().toLocaleDateString('th-TH')}\n`;
  sql += `-- ========================================================\n\n`;

  entities.forEach((entity) => {
    sql += `-- ตาราง: ${entity.name} (${entity.thaiName})\n`;
    sql += `CREATE TABLE ${entity.name} (\n`;

    const columnDefs: string[] = [];
    const pkCols: string[] = [];

    entity.attributes.forEach((att) => {
      let colDef = `    ${att.name.padEnd(20, ' ')} ${att.type}`;
      if (att.lengthOrPrecision && (att.type === 'VARCHAR' || att.type === 'DECIMAL')) {
        colDef += `(${att.lengthOrPrecision})`;
      }
      if (!att.isNullable) {
        colDef += ` NOT NULL`;
      }
      if (att.isPrimary) {
        pkCols.push(att.name);
      }
      if (att.thaiName) {
        colDef += ` -- ${att.thaiName}`;
      }
      columnDefs.push(colDef);
    });

    if (pkCols.length > 0) {
      columnDefs.push(`    PRIMARY KEY (${pkCols.join(', ')})`);
    }

    // Foreign Keys ที่สัมพันธ์กับตารางอื่น
    const incomingRels = relationships.filter(
      (r) => r.targetEntityId === entity.id && r.cardinality === '1:N'
    );
    incomingRels.forEach((rel) => {
      const parent = entities.find((e) => e.id === rel.sourceEntityId);
      if (parent) {
        const parentPK = parent.attributes.find((a) => a.isPrimary);
        // หา column ใน entity ปัจจุบัน
        const matchingFk =
          entity.attributes.find((a) => a.id === rel.foreignKeyAttributeId) ||
          entity.attributes.find((a) => parentPK && a.name.toLowerCase() === parentPK.name.toLowerCase()) ||
          entity.attributes.find((a) => a.name.toLowerCase() === `${parent.name.replace(/s$/, '')}_id`.toLowerCase());

        if (matchingFk && parentPK) {
          columnDefs.push(
            `    FOREIGN KEY (${matchingFk.name}) REFERENCES ${parent.name}(${parentPK.name}) ON DELETE RESTRICT ON UPDATE CASCADE`
          );
        }
      }
    });

    sql += columnDefs.join(',\n');
    sql += `\n);\n\n`;
  });

  return sql;
}

export function generateDocumentModel(entities: Entity[], relationships: Relationship[]): string {
  if (entities.length === 0) return '// ยังไม่มีข้อมูลเอนทิตี';

  const docSchema: Record<string, any> = {};

  entities.forEach((entity) => {
    const sampleDoc: Record<string, any> = {
      _id: 'ObjectId("660e5a9b7c12f00019a8e999")',
    };

    entity.attributes.forEach((att) => {
      if (att.isPrimary) return;

      let sampleVal: any = 'ตัวอย่างข้อมูล';
      if (att.type === 'INT') sampleVal = 101;
      else if (att.type === 'DECIMAL') sampleVal = 250.75;
      else if (att.type === 'DATE') sampleVal = '2026-06-15T08:30:00Z';
      else if (att.type === 'BOOLEAN') sampleVal = true;

      sampleDoc[att.name] = sampleVal;
    });

    // 1:N relations can be embedded or referenced
    const childRels = relationships.filter((r) => r.sourceEntityId === entity.id && r.cardinality === '1:N');
    childRels.forEach((rel) => {
      const child = entities.find((e) => e.id === rel.targetEntityId);
      if (child) {
        sampleDoc[`${child.name}_list (Embedded or Ref)`] = [
          {
            [`$ref_${child.name}_id`]: 'ObjectId("...")',
            note: 'สามารถฝังข้อมูลย่อย (Embed) หรืออ้างอิงรหัส (Reference)',
          },
        ];
      }
    });

    docSchema[`Collection: ${entity.name} (${entity.thaiName})`] = sampleDoc;
  });

  return JSON.stringify(docSchema, null, 2);
}

export function generateGraphCypher(entities: Entity[], relationships: Relationship[]): string {
  if (entities.length === 0) return '// ยังไม่มีข้อมูลเอนทิตี';

  let cypher = `// ========================================================\n`;
  cypher += `// คำสั่ง Cypher สำหรับสร้าง Graph Database (Neo4j)\n`;
  cypher += `// โครงสร้างโหนด (Nodes) และเส้นเชื่อมกำกับทิศทาง (Directed Edges)\n`;
  cypher += `// ========================================================\n\n`;

  cypher += `// 1. สร้าง Constraints (Node Keys / Unique Indexes)\n`;
  entities.forEach((ent) => {
    const pk = ent.attributes.find((a) => a.isPrimary);
    if (pk) {
      const label = ent.name.charAt(0).toUpperCase() + ent.name.slice(1).replace(/s$/, '');
      cypher += `CREATE CONSTRAINT FOR (n:${label}) REQUIRE n.${pk.name} IS UNIQUE;\n`;
    }
  });

  cypher += `\n// 2. ตัวอย่างคำสั่งสร้าง Nodes ตัวอย่าง\n`;
  entities.forEach((ent) => {
    const label = ent.name.charAt(0).toUpperCase() + ent.name.slice(1).replace(/s$/, '');
    const props = ent.attributes
      .slice(0, 3)
      .map((a) => `${a.name}: "${a.thaiName || a.name}"`)
      .join(', ');
    cypher += `CREATE (:${label} {${props}});\n`;
  });

  cypher += `\n// 3. สร้าง Relationships (Edges)\n`;
  relationships.forEach((rel) => {
    const source = entities.find((e) => e.id === rel.sourceEntityId);
    const target = entities.find((e) => e.id === rel.targetEntityId);
    if (source && target) {
      const sLabel = source.name.charAt(0).toUpperCase() + source.name.slice(1).replace(/s$/, '');
      const tLabel = target.name.charAt(0).toUpperCase() + target.name.slice(1).replace(/s$/, '');
      const relType = (rel.name || 'RELATED_TO').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      cypher += `MATCH (s:${sLabel}), (t:${tLabel})\n`;
      cypher += `WHERE s.id = t.source_id\n`;
      cypher += `CREATE (s)-[:${relType} {cardinality: "${rel.cardinality}", label: "${rel.thaiName}"}]->(t);\n\n`;
    }
  });

  return cypher;
}

export function generateKeyValueRedis(entities: Entity[]): string {
  if (entities.length === 0) return '# ยังไม่มีข้อมูลเอนทิตี';

  let redis = `# ========================================================\n`;
  redis += `# โครงสร้าง Key-Value Store และ Cache (Redis Commands)\n`;
  redis += `# การตั้งชื่อคีย์แบบลำดับชั้น (Hierarchical Key Naming Pattern)\n`;
  redis += `# ========================================================\n\n`;

  entities.forEach((ent) => {
    const prefix = ent.name.replace(/s$/, '').toLowerCase();
    const pk = ent.attributes.find((a) => a.isPrimary)?.name || 'id';

    redis += `# --- Entity: ${ent.name} (${ent.thaiName}) ---\n`;
    redis += `# 1. บันทึกข้อมูลแถวด้วย Redis Hash (HSET)\n`;
    const hashFields = ent.attributes.map((a) => `${a.name} "${a.thaiName || a.name}"`).join(' ');
    redis += `HSET ${prefix}:1001 ${hashFields}\n\n`;

    redis += `# 2. ดึงข้อมูลทั้งก้อน\n`;
    redis += `HGETALL ${prefix}:1001\n\n`;

    redis += `# 3. บันทึกดัชนีรายการรหัสทั้งหมดด้วย Redis Set (SADD)\n`;
    redis += `SADD ${prefix}:all:ids "1001" "1002" "1003"\n\n`;
  });

  return redis;
}

export function generateStarSchemaBI(entities: Entity[], relationships: Relationship[]): string {
  if (entities.length === 0) return '-- ยังไม่มีข้อมูลเอนทิตี';

  let md = `# ========================================================\n`;
  md += `# แบบจำลองมิติข้อมูล Star Schema (Data Warehouse & BI)\n`;
  md += `# สำหรับการวิเคราะห์รายงานข้อมูลขนาดใหญ่และ Dashboard\n`;
  md += `# ========================================================\n\n`;

  // หาตารางที่มีความสัมพันธ์เข้ามามากสุด หรือชื่อ order/enrollment/ticket ให้เป็น Fact Table
  const sortedByConnections = [...entities].sort((a, b) => {
    const countA = relationships.filter((r) => r.targetEntityId === a.id).length;
    const countB = relationships.filter((r) => r.targetEntityId === b.id).length;
    return countB - countA;
  });

  const fact = sortedByConnections[0];
  const dimensions = sortedByConnections.slice(1);

  if (fact) {
    md += `## 🌟 ตารางข้อเท็จจริง (Fact Table): \`${fact.name}\` (${fact.thaiName})\n`;
    md += `หน้าที่: เก็บข้อมูลเชิงปริมาณ (Measures / ตัวเลขสรุปยอด) และเชื่อมโยง Dimension Keys\n`;
    md += `- Surrogate Key: \`fact_${fact.name}_sk INT PRIMARY KEY\`\n`;
    md += `- ตัวชี้วัด (Measures):\n`;
    fact.attributes
      .filter((a) => a.type === 'DECIMAL' || a.type === 'INT')
      .forEach((a) => {
        md += `  * \`${a.name}\` (${a.thaiName}) [SUM, AVG, MIN, MAX]\n`;
      });
    md += `\n`;
  }

  md += `## 📐 ตารางมิติข้อมูล (Dimension Tables)\n`;
  md += `หน้าที่: ให้บริบทมุมมองในการวิเคราะห์ (ใคร, ที่ไหน, เมื่อไหร่, หมวดหมู่อะไร)\n`;

  dimensions.forEach((dim) => {
    md += `### • ตารางมิติ: \`dim_${dim.name}\` (${dim.thaiName})\n`;
    dim.attributes.forEach((att) => {
      md += `  - \`${att.name}\`: ${att.thaiName || att.name} (${att.type})\n`;
    });
    md += `\n`;
  });

  return md;
}
