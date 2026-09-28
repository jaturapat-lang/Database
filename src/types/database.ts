export type DataType = 'INT' | 'VARCHAR' | 'TEXT' | 'DATE' | 'DECIMAL' | 'BOOLEAN';

export interface Attribute {
  id: string;
  name: string;
  thaiName?: string;
  type: DataType;
  lengthOrPrecision?: string;
  isPrimary: boolean;
  isForeign: boolean;
  isNullable: boolean;
  references?: {
    entityId: string;
    attributeId: string;
  };
  description?: string;
}

export interface Entity {
  id: string;
  name: string;
  thaiName: string;
  attributes: Attribute[];
  x: number;
  y: number;
  color?: string;
  notes?: string;
}

export type Cardinality = '1:1' | '1:N' | 'N:M';
export type Participation = 'mandatory' | 'optional';

export interface Relationship {
  id: string;
  name: string;
  thaiName: string;
  sourceEntityId: string;
  targetEntityId: string;
  cardinality: Cardinality;
  sourceParticipation: Participation;
  targetParticipation: Participation;
  foreignKeyAttributeId?: string;
  notes?: string;
}

export type DatabaseModelType = 
  | 'relational' 
  | 'document' 
  | 'graph' 
  | 'keyvalue' 
  | 'star_schema';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  pedagogyTip: string;
  affectedEntityIds: string[];
  affectedRelationshipIds: string[];
  autoFixable: boolean;
  fixActionLabel?: string;
  fixType?: 'add_primary_key' | 'create_junction_table' | 'sync_foreign_key' | 'remove_orphan' | 'set_cardinality';
  modelSpecific?: DatabaseModelType;
}

export interface RubricScore {
  tableStructureScore: number; // 25
  keyDesignScore: number; // 25
  relationshipModelScore: number; // 25
  normalizationIntegrityScore: number; // 25
  totalScore: number; // 100
  grade: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  teacherComment: string;
}

export type DiagramNotation = 'crows_foot' | 'chen';

export interface SchemaProject {
  name: string;
  description: string;
  entities: Entity[];
  relationships: Relationship[];
}

export interface Challenge {
  id: string;
  title: string;
  level: 'เริ่มต้น' | 'ปานกลาง' | 'ท้าทาย';
  levelNum: 1 | 2 | 3;
  description: string;
  objective: string;
  initialSchema: SchemaProject;
  targetCriteria: {
    noErrors: boolean;
    minScore: number;
    description: string;
  };
}
