import {
  Entity,
  Relationship,
  ValidationIssue,
  RubricScore,
  DatabaseModelType,
} from '../types/database';

export function validateDatabaseModel(
  entities: Entity[],
  relationships: Relationship[],
  modelType: DatabaseModelType = 'relational'
): {
  issues: ValidationIssue[];
  rubric: RubricScore;
} {
  const issues: ValidationIssue[] = [];

  // 1. ตรวจสอบ Entity พื้นฐาน (Primary Key, การตั้งชื่อ, Attributes)
  entities.forEach((entity) => {
    // 1.1 ตรวจหา Primary Key
    const primaryKeys = entity.attributes.filter((a) => a.isPrimary);
    if (primaryKeys.length === 0) {
      issues.push({
        id: `issue_pk_${entity.id}`,
        ruleId: 'RULE_MISSING_PRIMARY_KEY',
        severity: 'error',
        title: `ขาดคีย์หลัก (Primary Key) ในตาราง '${entity.name}'`,
        message: `ตาราง '${entity.thaiName || entity.name}' ยังไม่มีคอลัมน์ใดถูกกำหนดให้เป็น Primary Key (PK) เลย`,
        pedagogyTip:
          'หลักการออกแบบฐานข้อมูลเบื้องต้น: ทุกตาราง "ต้องมี Primary Key" เพื่อระบุเอกลักษณ์ของแต่ละแถวข้อมูล (ตามกฎบรรทัดฐาน 1NF)',
        affectedEntityIds: [entity.id],
        affectedRelationshipIds: [],
        autoFixable: true,
        fixActionLabel: `+ เพิ่ม '${entity.name.replace(/s$/, '')}_id' เป็น Primary Key`,
        fixType: 'add_primary_key',
      });
    }

    // 1.2 ตรวจสอบชื่อ Entity
    if (!entity.name || entity.name.trim() === '') {
      issues.push({
        id: `issue_empty_name_${entity.id}`,
        ruleId: 'RULE_EMPTY_ENTITY_NAME',
        severity: 'error',
        title: `พบเอนทิตีที่ยังไม่ได้ตั้งชื่อ`,
        message: `มีเอนทิตีในระบบที่ยังไม่มีชื่อภาษาอังกฤษสำหรับสร้างตาราง`,
        pedagogyTip: 'ควรตั้งชื่อภาษาอังกฤษเป็นตัวพิมพ์เล็ก ไม่มีช่องว่าง เช่น students, orders',
        affectedEntityIds: [entity.id],
        affectedRelationshipIds: [],
        autoFixable: false,
      });
    }

    // 1.3 ตรวจสอบชื่อแอตทริบิวต์ซ้ำในตารางเดียวกัน
    const attrNames = new Set<string>();
    entity.attributes.forEach((att) => {
      const lower = att.name.toLowerCase().trim();
      if (lower) {
        if (attrNames.has(lower)) {
          issues.push({
            id: `issue_dup_attr_${entity.id}_${lower}`,
            ruleId: 'RULE_DUPLICATE_ATTRIBUTE',
            severity: 'error',
            title: `ชื่อคอลัมน์ซ้ำในตาราง '${entity.name}'`,
            message: `พบคอลัมน์ชื่อ '${att.name}' ซ้ำกันภายในตารางเดียวกัน`,
            pedagogyTip: 'คอลัมน์ในตารางเดียวกันต้องมีชื่อที่ไม่ซ้ำกันเพื่อป้องกันความสับสนของระบบ SQL',
            affectedEntityIds: [entity.id],
            affectedRelationshipIds: [],
            autoFixable: false,
          });
        }
        attrNames.add(lower);
      }
    });

    // 1.4 ตรวจสอบตารางกำพร้า (Orphan Entity)
    const connectedRels = relationships.filter(
      (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
    );
    if (entities.length > 1 && connectedRels.length === 0) {
      issues.push({
        id: `issue_orphan_${entity.id}`,
        ruleId: 'RULE_ORPHAN_ENTITY',
        severity: 'warning',
        title: `ตารางโดดเดี่ยว (Orphan Table) '${entity.name}'`,
        message: `ตาราง '${entity.thaiName || entity.name}' ยังไม่มีความสัมพันธ์เชื่อมโยงกับตารางใดในระบบเลย`,
        pedagogyTip:
          'ในระบบฐานข้อมูลเชิงสัมพันธ์ ทุกตารางมักจะต้องมีความเชื่อมโยง (Relationship) กับกระบวนการอื่น เช่น ตารางสินค้าต้องเชื่อมกับตารางคำสั่งซื้อ',
        affectedEntityIds: [entity.id],
        affectedRelationshipIds: [],
        autoFixable: false,
      });
    }
  });

  // 2. ตรวจสอบชื่อ Entity ซ้ำกันในระดับโครงการ
  const entityNames = new Set<string>();
  entities.forEach((entity) => {
    const lower = entity.name.toLowerCase().trim();
    if (lower) {
      if (entityNames.has(lower)) {
        issues.push({
          id: `issue_dup_entity_${lower}`,
          ruleId: 'RULE_DUPLICATE_ENTITY',
          severity: 'error',
          title: `ชื่อตาราง '${entity.name}' ซ้ำกันในระบบ`,
          message: `พบการตั้งชื่อตารางซ้ำกันในโมเดลฐานข้อมูล`,
          pedagogyTip: 'ชื่อตารางในระบบฐานข้อมูลเดียวกันต้องไม่ซ้ำกัน',
          affectedEntityIds: [entity.id],
          affectedRelationshipIds: [],
          autoFixable: false,
        });
      }
      entityNames.add(lower);
    }
  });

  // 3. ตรวจสอบความถูกต้องของ Relationships ตามแต่ละ Model
  relationships.forEach((rel) => {
    const source = entities.find((e) => e.id === rel.sourceEntityId);
    const target = entities.find((e) => e.id === rel.targetEntityId);

    if (!source || !target) {
      issues.push({
        id: `issue_broken_rel_${rel.id}`,
        ruleId: 'RULE_BROKEN_RELATIONSHIP',
        severity: 'error',
        title: `ความสัมพันธ์เชื่อมไปยังตารางที่ไม่มีอยู่จริง`,
        message: `เส้นความสัมพันธ์ '${rel.thaiName || rel.name}' อ้างอิงตารางที่ถูกลบไปแล้ว`,
        pedagogyTip: 'ควรลบหรือปรับปรุงเส้นความสัมพันธ์ให้ชี้ไปยังตารางที่มีอยู่ในระบบ',
        affectedEntityIds: [],
        affectedRelationshipIds: [rel.id],
        autoFixable: false,
      });
      return;
    }

    // 3.1 ตรวจสอบความสัมพันธ์ Many-to-Many (N:M)
    if (rel.cardinality === 'N:M') {
      if (modelType === 'relational') {
        issues.push({
          id: `issue_nm_relational_${rel.id}`,
          ruleId: 'RULE_NM_RELATIONAL_VIOLATION',
          severity: 'error',
          title: `พบความสัมพันธ์ Many-to-Many (N:M) ในโมเดลเชิงสัมพันธ์`,
          message: `ความสัมพันธ์ระหว่าง '${source.name}' และ '${target.name}' เป็นแบบ N:M ซึ่งไม่สามารถสร้างในระบบ RDBMS (SQL) ได้โดยตรง`,
          pedagogyTip:
            'กฎทองของวิชาฐานข้อมูล ปวช.1: ความสัมพันธ์แบบ N:M ต้องแตกออกเป็น 1:N สองเส้น โดยแทรก "ตารางเชื่อม" (Junction Table / Bridge Table) เช่น ' +
            `${source.name}_${target.name} ที่บรรจุ Foreign Key ของทั้งสองตาราง!`,
          affectedEntityIds: [source.id, target.id],
          affectedRelationshipIds: [rel.id],
          autoFixable: true,
          fixActionLabel: `⚡ แก้ปัญหาอัตโนมัติ: สร้างตารางเชื่อม '${source.name.replace(/s$/, '')}_${target.name}'`,
          fixType: 'create_junction_table',
          modelSpecific: 'relational',
        });
      } else if (modelType === 'document') {
        issues.push({
          id: `issue_nm_doc_${rel.id}`,
          ruleId: 'RULE_NM_DOCUMENT_INFO',
          severity: 'info',
          title: `โมเดล Document (NoSQL): จัดการ N:M ได้ด้วย Embedding หรือ Array of IDs`,
          message: `ใน MongoDB สามารถเก็บ Array of ObjectIds เช่น ${target.name}_ids: [...] ในเอกสาร ${source.name} ได้`,
          pedagogyTip:
            'ข้อควรระวัง: หากรายการมีจำนวนมากเกินไป (เช่น เกิน 1,000 รายการ) ควรแยกเป็น 2 Collections เพื่อไม่ให้ติดขีดจำกัด 16MB ของ MongoDB',
          affectedEntityIds: [source.id, target.id],
          affectedRelationshipIds: [rel.id],
          autoFixable: false,
          modelSpecific: 'document',
        });
      } else if (modelType === 'graph') {
        issues.push({
          id: `issue_nm_graph_${rel.id}`,
          ruleId: 'RULE_NM_GRAPH_SUCCESS',
          severity: 'success',
          title: `โมเดล Graph: รองรับความสัมพันธ์ N:M อย่างสมบูรณ์แบบ`,
          message: `ระบบ Graph (เช่น Neo4j) รองรับ Directed Relationship N:M ได้โดยตรง ไม่จำเป็นต้องสร้างตารางเชื่อม`,
          pedagogyTip:
            `สามารถกำหนดความสัมพันธ์ (: ${source.name}) -[:${rel.name.toUpperCase()}]-> (: ${target.name}) ได้อย่างเป็นธรรมชาติ พร้อมใส่ Attributes บนเส้นได้`,
          affectedEntityIds: [source.id, target.id],
          affectedRelationshipIds: [rel.id],
          autoFixable: false,
          modelSpecific: 'graph',
        });
      }
    }

    // 3.2 ตรวจสอบ Foreign Key ในความสัมพันธ์แบบ 1:N ใน Relational Model
    if (modelType === 'relational' && rel.cardinality === '1:N') {
      const sourcePK = source.attributes.find((a) => a.isPrimary);
      // ฝั่ง Many คือ Target -> ตรวจว่า target มี FK ที่อ้างถึง source หรือไม่
      const targetHasFK = target.attributes.some(
        (a) =>
          a.isForeign ||
          (sourcePK && a.name.toLowerCase() === sourcePK.name.toLowerCase()) ||
          a.name.toLowerCase() === `${source.name.replace(/s$/, '')}_id`.toLowerCase()
      );

      if (!targetHasFK) {
        const expectedFkName = sourcePK ? sourcePK.name : `${source.name.replace(/s$/, '')}_id`;
        issues.push({
          id: `issue_missing_fk_${rel.id}`,
          ruleId: 'RULE_MISSING_FOREIGN_KEY',
          severity: 'warning',
          title: `ตารางฝั่ง N ('${target.name}') ยังไม่มี Foreign Key ชี้ไปยัง '${source.name}'`,
          message: `ในความสัมพันธ์ 1:N ตาราง '${target.thaiName || target.name}' (ฝั่ง Many) ควรมีคอลัมน์ Foreign Key (เช่น '${expectedFkName}') เพื่อเชื่อมโยง`,
          pedagogyTip:
            'หลักการ RDBMS: คีย์นอก (Foreign Key) ต้องถูกนำไปใส่ไว้ในตารางฝั่ง Many (N) เสมอ เพื่อบอกว่าข้อมูลนี้เป็นของแถวใดในตารางฝั่ง One (1)',
          affectedEntityIds: [target.id],
          affectedRelationshipIds: [rel.id],
          autoFixable: true,
          fixActionLabel: `+ เพิ่ม '${expectedFkName}' (FK) ใน '${target.name}'`,
          fixType: 'sync_foreign_key',
          modelSpecific: 'relational',
        });
      }
    }

    // 3.3 ตรวจสอบความสัมพันธ์ 1:1
    if (rel.cardinality === '1:1') {
      issues.push({
        id: `issue_1to1_info_${rel.id}`,
        ruleId: 'RULE_1TO1_INFO',
        severity: 'info',
        title: `ความสัมพันธ์แบบ 1:1 ระหว่าง '${source.name}' และ '${target.name}'`,
        message: `ความสัมพันธ์ 1:1 บ่งชี้ว่า 1 แถวของ '${source.name}' ตรงกับ 1 แถวของ '${target.name}' เท่านั้น`,
        pedagogyTip:
          'คำแนะนำวิชาการ: หากข้อมูลไม่ได้ถูกแยกด้วยเหตุผลความปลอดภัยหรือประสิทธิภาพ อาจพิจารณารวมเป็นตารางเดียวกันเพื่อลดจำนวนการ JOIN',
        affectedEntityIds: [source.id, target.id],
        affectedRelationshipIds: [rel.id],
        autoFixable: false,
      });
    }
  });

  // 4. ตรวจสอบการวนลูปของความสัมพันธ์ (Circular Dependency)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(entityId: string): boolean {
    visited.add(entityId);
    recursionStack.add(entityId);

    const outRels = relationships.filter((r) => r.sourceEntityId === entityId);
    for (const rel of outRels) {
      const neighbor = rel.targetEntityId;
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor) && neighbor !== entityId) {
        return true;
      }
    }

    recursionStack.delete(entityId);
    return false;
  }

  entities.forEach((ent) => {
    if (!visited.has(ent.id)) {
      if (hasCycle(ent.id)) {
        issues.push({
          id: `issue_cycle_${ent.id}`,
          ruleId: 'RULE_CIRCULAR_DEPENDENCY',
          severity: 'warning',
          title: `พบความสัมพันธ์แบบวงวน (Circular Dependency)`,
          message: `มีความสัมพันธ์ที่เชื่อมโยงวนกลับมายังตารางเดิม ซึ่งอาจส่งผลต่อการ INSERT/DELETE ข้อมูลใน RDBMS (Deadlock or FK constraint)`,
          pedagogyTip:
            'ควรตรวจสอบทิศทางการอ้างอิงของ Foreign Key หรือกำหนด ON DELETE CASCADE / SET NULL ให้รอบคอบ',
          affectedEntityIds: [ent.id],
          affectedRelationshipIds: [],
          autoFixable: false,
        });
      }
    }
  });

  // 5. ตรวจสอบ Star Schema Model โดยเฉพาะ
  if (modelType === 'star_schema') {
    // หา Fact table (มักมีชื่อขึ้นต้นด้วย fact_ หรือมี foreign keys และตัวเลขจำนวนมาก)
    const factTables = entities.filter(
      (e) =>
        e.name.toLowerCase().startsWith('fact_') ||
        e.attributes.filter((a) => a.isForeign).length >= 2
    );

    if (factTables.length === 0) {
      issues.push({
        id: 'issue_star_no_fact',
        ruleId: 'RULE_STAR_NO_FACT',
        severity: 'warning',
        title: 'ไม่พบตารางข้อเท็จจริง (Fact Table) ในโมเดล Star Schema',
        message: 'แบบจำลอง Star Schema ควรมี Fact Table ตรงกลางอย่างน้อย 1 ตารางที่รวบรวมตัวชี้วัด (Measures/Metrics)',
        pedagogyTip: 'ตัวอย่าง: ตาราง fact_sales หรือ fact_enrollment ที่เก็บยอดเงิน, คะแนน, และรหัสเชื่อมไปยัง Dimension ต่างๆ',
        affectedEntityIds: [],
        affectedRelationshipIds: [],
        autoFixable: false,
        modelSpecific: 'star_schema',
      });
    }
  }

  // 6. คำนวณ Rubric Score สำหรับนักเรียน ปวช.1 (100 คะแนนเต็ม)
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  let tableStructureScore = 25;
  let keyDesignScore = 25;
  let relationshipModelScore = 25;
  let normalizationIntegrityScore = 25;

  // หักคะแนนตามข้อผิดพลาด
  issues.forEach((issue) => {
    if (issue.ruleId === 'RULE_MISSING_PRIMARY_KEY') {
      keyDesignScore = Math.max(0, keyDesignScore - 15);
      normalizationIntegrityScore = Math.max(0, normalizationIntegrityScore - 5);
    }
    if (issue.ruleId === 'RULE_NM_RELATIONAL_VIOLATION') {
      relationshipModelScore = Math.max(0, relationshipModelScore - 15);
      tableStructureScore = Math.max(0, tableStructureScore - 5);
    }
    if (issue.ruleId === 'RULE_MISSING_FOREIGN_KEY') {
      relationshipModelScore = Math.max(0, relationshipModelScore - 8);
      keyDesignScore = Math.max(0, keyDesignScore - 5);
    }
    if (issue.ruleId === 'RULE_ORPHAN_ENTITY') {
      tableStructureScore = Math.max(0, tableStructureScore - 6);
    }
    if (issue.ruleId === 'RULE_DUPLICATE_ENTITY' || issue.ruleId === 'RULE_DUPLICATE_ATTRIBUTE') {
      tableStructureScore = Math.max(0, tableStructureScore - 10);
    }
    if (issue.ruleId === 'RULE_CIRCULAR_DEPENDENCY') {
      relationshipModelScore = Math.max(0, relationshipModelScore - 5);
    }
  });

  const totalScore = Math.max(
    0,
    tableStructureScore + keyDesignScore + relationshipModelScore + normalizationIntegrityScore
  );

  let grade: RubricScore['grade'] = 'F';
  let teacherComment = '';

  if (totalScore >= 90) {
    grade = 'A';
    teacherComment =
      'ยอดเยี่ยมมากครับ! แบบจำลอง ER Diagram ของน้องถูกต้องตามหลักวิศวกรรมฐานข้อมูล คีย์หลัก คีย์นอก และความสัมพันธ์ถูกออกแบบอย่างมืออาชีพ พร้อมนำไปสร้างระบบจริงได้เลย!';
  } else if (totalScore >= 80) {
    grade = 'B+';
    teacherComment =
      'ทำได้ดีมากครับ! โครงสร้างพื้นฐานแน่นหนา มีข้อผิดพลาดเล็กน้อยที่แนะนำให้ปรับปรุงอีกนิดเดียว จะกลายเป็นฐานข้อมูลที่สมบูรณ์แบบ!';
  } else if (totalScore >= 70) {
    grade = 'B';
    teacherComment =
      'ผ่านเกณฑ์มาตรฐาน ปวช.1 ครับ มีบางจุดเรื่อง Foreign Key หรือตารางเชื่อมโยงที่ควรเก็บรายละเอียดเพิ่มเติม';
  } else if (totalScore >= 60) {
    grade = 'C+';
    teacherComment =
      'มีแนวคิดที่ดี แต่ยังพบข้อผิดพลาดด้านความสัมพันธ์หรือคีย์หลักที่ต้องแก้ไข ลองกดดูคำแนะนำในระบบตรวจอัตโนมัติแล้วแก้ไขตามนะครับ';
  } else if (totalScore >= 50) {
    grade = 'C';
    teacherComment =
      'พอใช้ได้ครับ มีโครงสร้างบางส่วนถูกต้อง แต่ยังมีจุดบกพร่องเรื่องความสัมพันธ์ N:M หรือขาด Primary Key ซึ่งจะทำให้ระบบ SQL ทำงานไม่ได้';
  } else if (totalScore >= 40) {
    grade = 'D';
    teacherComment =
      'ยังไม่ผ่านเกณฑ์การประเมินครับ น้องๆ ต้องตรวจสอบว่าทุกตารางมี Primary Key หรือไม่ และห้ามเชื่อม N:M โดยตรงในโมเดล Relational';
  } else {
    grade = 'F';
    teacherComment =
      'ต้องการการปรับปรุงอย่างมากครับ ลองเปิดดู "เทมเพลตตัวอย่าง" หรือ "คู่มือสำหรับ ปวช.1" เพื่อเรียนรู้วิธีการกำหนดคีย์และความสัมพันธ์ที่ถูกต้องนะครับ';
  }

  // หากไม่มี Error เลย และมีตารางเชื่อมโยงสมบูรณ์ ให้แสดงผล Success item
  if (errorCount === 0 && entities.length > 0) {
    issues.unshift({
      id: 'issue_all_valid',
      ruleId: 'RULE_ALL_VALID',
      severity: 'success',
      title: 'โครงสร้างฐานข้อมูลผ่านการตรวจสอบสมบูรณ์!',
      message: `ไม่พบข้อผิดพลาดร้ายแรงในโมเดล ${modelType.toUpperCase()} ทุกตารางมีคีย์หลัก และความสัมพันธ์สอดคล้องตามมาตรฐาน`,
      pedagogyTip: 'สามารถกดแท็บ "แบบจำลองหลากโมเดล" เพื่อดูคำสั่ง SQL DDL, โครงสร้าง NoSQL หรือคำสั่ง Cypher Graph ได้ทันที',
      affectedEntityIds: [],
      affectedRelationshipIds: [],
      autoFixable: false,
    });
  }

  return {
    issues,
    rubric: {
      tableStructureScore,
      keyDesignScore,
      relationshipModelScore,
      normalizationIntegrityScore,
      totalScore,
      grade,
      teacherComment,
    },
  };
}

/**
 * ฟังก์ชันสร้างตารางเชื่อม (Junction Table) อัตโนมัติเมื่อเจอปัญหา N:M ใน Relational
 */
export function resolveManytoManyJunction(
  sourceEntity: Entity,
  targetEntity: Entity,
  relationshipId: string,
  entities: Entity[],
  relationships: Relationship[]
): {
  newEntities: Entity[];
  newRelationships: Relationship[];
} {
  const sourcePK = sourceEntity.attributes.find((a) => a.isPrimary) || sourceEntity.attributes[0];
  const targetPK = targetEntity.attributes.find((a) => a.isPrimary) || targetEntity.attributes[0];

  const junctionName = `${sourceEntity.name.replace(/s$/, '')}_${targetEntity.name}`.toLowerCase();
  const junctionThaiName = `ตารางเชื่อม ${sourceEntity.thaiName}-${targetEntity.thaiName}`;

  // คำนวณพิกัดกึ่งกลางระหว่างสองเอนทิตี
  const midX = Math.round((sourceEntity.x + targetEntity.x) / 2);
  const midY = Math.round((sourceEntity.y + targetEntity.y) / 2) + 60;

  const junctionId = `ent_junction_${Date.now()}`;
  const sourceFkName = sourcePK ? sourcePK.name : `${sourceEntity.name.replace(/s$/, '')}_id`;
  const targetFkName = targetPK ? targetPK.name : `${targetEntity.name.replace(/s$/, '')}_id`;

  const junctionEntity: Entity = {
    id: junctionId,
    name: junctionName,
    thaiName: junctionThaiName,
    x: midX,
    y: midY,
    color: '#f59e0b',
    notes: 'สร้างขึ้นโดยระบบอัตโนมัติเพื่อแปลงความสัมพันธ์ N:M เป็น 1:N ตามหลักการออกแบบฐานข้อมูลเชิงสัมพันธ์',
    attributes: [
      {
        id: `att_${junctionId}_id`,
        name: `${junctionName.replace(/s$/, '')}_id`,
        thaiName: 'รหัสตารางเชื่อม (PK)',
        type: 'INT',
        isPrimary: true,
        isForeign: false,
        isNullable: false,
      },
      {
        id: `att_${junctionId}_fk1`,
        name: sourceFkName,
        thaiName: `รหัส${sourceEntity.thaiName} (FK)`,
        type: sourcePK?.type || 'INT',
        lengthOrPrecision: sourcePK?.lengthOrPrecision,
        isPrimary: false,
        isForeign: true,
        isNullable: false,
      },
      {
        id: `att_${junctionId}_fk2`,
        name: targetFkName,
        thaiName: `รหัส${targetEntity.thaiName} (FK)`,
        type: targetPK?.type || 'INT',
        lengthOrPrecision: targetPK?.lengthOrPrecision,
        isPrimary: false,
        isForeign: true,
        isNullable: false,
      },
      {
        id: `att_${junctionId}_created_at`,
        name: 'created_at',
        thaiName: 'วันที่บันทึก',
        type: 'DATE',
        isPrimary: false,
        isForeign: false,
        isNullable: true,
      },
    ],
  };

  // ลบความสัมพันธ์ N:M เดิมออก แล้วแทนที่ด้วยความสัมพันธ์ 1:N สองเส้น
  const filteredRelationships = relationships.filter((r) => r.id !== relationshipId);

  const rel1: Relationship = {
    id: `rel_${sourceEntity.id}_${junctionId}`,
    name: `has_${junctionName}`,
    thaiName: `มี${junctionThaiName}`,
    sourceEntityId: sourceEntity.id,
    targetEntityId: junctionId,
    cardinality: '1:N',
    sourceParticipation: 'mandatory',
    targetParticipation: 'mandatory',
    foreignKeyAttributeId: `att_${junctionId}_fk1`,
  };

  const rel2: Relationship = {
    id: `rel_${targetEntity.id}_${junctionId}`,
    name: `in_${junctionName}`,
    thaiName: `ใน${junctionThaiName}`,
    sourceEntityId: targetEntity.id,
    targetEntityId: junctionId,
    cardinality: '1:N',
    sourceParticipation: 'mandatory',
    targetParticipation: 'mandatory',
    foreignKeyAttributeId: `att_${junctionId}_fk2`,
  };

  return {
    newEntities: [...entities, junctionEntity],
    newRelationships: [...filteredRelationships, rel1, rel2],
  };
}
