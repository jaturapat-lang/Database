import React, { useState, useEffect, useMemo } from 'react';
import {
  Entity,
  Relationship,
  DiagramNotation,
  DatabaseModelType,
  ValidationIssue,
  Challenge,
  SchemaProject,
} from './types/database';
import { TEMPLATES } from './data/templates';
import { validateDatabaseModel, resolveManytoManyJunction } from './utils/validationEngine';

import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ValidationPanel } from './components/ValidationPanel';
import { MultiModelViewer } from './components/MultiModelViewer';
import { EntityModal } from './components/EntityModal';
import { RelationshipModal } from './components/RelationshipModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ChallengeModal } from './components/ChallengeModal';
import { VocationalGuideModal } from './components/VocationalGuideModal';
import { AiTutorModal } from './components/AiTutorModal';

export default function App() {
  // Initial default state with college enrollment template
  const defaultTemplate = TEMPLATES.college_enrollment;
  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('simudata_entities');
    return saved ? JSON.parse(saved) : defaultTemplate.entities;
  });

  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    const saved = localStorage.getItem('simudata_relationships');
    return saved ? JSON.parse(saved) : defaultTemplate.relationships;
  });

  const [activeTab, setActiveTab] = useState<'canvas' | 'validation' | 'multimodel' | 'challenges' | 'guide'>('canvas');
  const [notation, setNotation] = useState<DiagramNotation>('crows_foot');
  const [currentModel, setCurrentModel] = useState<DatabaseModelType>('relational');
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  // Modals state
  const [isEntityModalOpen, setIsEntityModalOpen] = useState<boolean>(false);
  const [selectedEntityForEdit, setSelectedEntityForEdit] = useState<Entity | null>(null);

  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState<boolean>(false);
  const [selectedRelationshipForEdit, setSelectedRelationshipForEdit] = useState<Relationship | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [connectTargetId, setConnectTargetId] = useState<string | null>(null);

  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isAiTutorModalOpen, setIsAiTutorModalOpen] = useState<boolean>(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('simudata_entities', JSON.stringify(entities));
      localStorage.setItem('simudata_relationships', JSON.stringify(relationships));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [entities, relationships]);

  // Real-time automatic relationship validation engine
  const { issues, rubric } = useMemo(() => {
    return validateDatabaseModel(entities, relationships, currentModel);
  }, [entities, relationships, currentModel]);

  const errorCount = issues.filter((i) => i.severity === 'error').length;

  // Handle entity position updates (dragging)
  const handleUpdateEntityPosition = (id: string, x: number, y: number) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.id === id ? { ...ent, x, y } : ent))
    );
  };

  // Add or Save Entity
  const handleSaveEntity = (savedEntity: Entity) => {
    setEntities((prev) => {
      const exists = prev.some((e) => e.id === savedEntity.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEntity.id ? savedEntity : e));
      }
      return [...prev, savedEntity];
    });
  };

  // Delete Entity
  const handleDeleteEntity = (id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    // Also remove any relationships attached to this entity
    setRelationships((prev) =>
      prev.filter((r) => r.sourceEntityId !== id && r.targetEntityId !== id)
    );
  };

  // Add or Save Relationship
  const handleSaveRelationship = (savedRel: Relationship) => {
    setRelationships((prev) => {
      const exists = prev.some((r) => r.id === savedRel.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRel.id ? savedRel : r));
      }
      return [...prev, savedRel];
    });
  };

  // Delete Relationship
  const handleDeleteRelationship = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
  };

  // Interactive connector flow
  const handleStartConnect = (sourceId: string) => {
    setConnectSourceId(sourceId);
  };

  const handleCompleteConnect = (targetId: string) => {
    if (connectSourceId && connectSourceId !== targetId) {
      setConnectTargetId(targetId);
      setSelectedRelationshipForEdit(null);
      setIsRelationshipModalOpen(true);
    }
    setConnectSourceId(null);
  };

  const handleCancelConnect = () => {
    setConnectSourceId(null);
    setConnectTargetId(null);
  };

  // Auto-Fix Engine
  const handleApplyFix = (issue: ValidationIssue) => {
    if (issue.fixType === 'create_junction_table') {
      const relId = issue.affectedRelationshipIds[0];
      const rel = relationships.find((r) => r.id === relId);
      if (rel) {
        const source = entities.find((e) => e.id === rel.sourceEntityId);
        const target = entities.find((e) => e.id === rel.targetEntityId);
        if (source && target) {
          const { newEntities, newRelationships } = resolveManytoManyJunction(
            source,
            target,
            rel.id,
            entities,
            relationships
          );
          setEntities(newEntities);
          setRelationships(newRelationships);
        }
      }
    } else if (issue.fixType === 'add_primary_key') {
      const entId = issue.affectedEntityIds[0];
      setEntities((prev) =>
        prev.map((ent) => {
          if (ent.id === entId) {
            const pkName = `${ent.name.replace(/s$/, '')}_id`.toLowerCase();
            const newPkAttr = {
              id: `att_${ent.id}_pk_${Date.now()}`,
              name: pkName,
              thaiName: `รหัส${ent.thaiName || ent.name}`,
              type: 'INT' as const,
              isPrimary: true,
              isForeign: false,
              isNullable: false,
            };
            return {
              ...ent,
              attributes: [newPkAttr, ...ent.attributes],
            };
          }
          return ent;
        })
      );
    } else if (issue.fixType === 'sync_foreign_key') {
      const relId = issue.affectedRelationshipIds[0];
      const rel = relationships.find((r) => r.id === relId);
      if (rel) {
        const source = entities.find((e) => e.id === rel.sourceEntityId);
        const target = entities.find((e) => e.id === rel.targetEntityId);
        if (source && target) {
          const sourcePK = source.attributes.find((a) => a.isPrimary) || source.attributes[0];
          const fkName = sourcePK ? sourcePK.name : `${source.name.replace(/s$/, '')}_id`;
          const newFkAttr = {
            id: `att_${target.id}_fk_${Date.now()}`,
            name: fkName,
            thaiName: `รหัส${source.thaiName} (FK)`,
            type: sourcePK?.type || 'INT',
            lengthOrPrecision: sourcePK?.lengthOrPrecision,
            isPrimary: false,
            isForeign: true,
            isNullable: false,
          };
          setEntities((prev) =>
            prev.map((e) => (e.id === target.id ? { ...e, attributes: [...e.attributes, newFkAttr] } : e))
          );
        }
      }
    }
  };

  // Load template
  const handleLoadTemplate = (template: SchemaProject) => {
    setEntities(template.entities);
    setRelationships(template.relationships);
    setActiveChallengeId(null);
  };

  // Load challenge
  const handleLoadChallenge = (challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    setEntities(challenge.initialSchema.entities);
    setRelationships(challenge.initialSchema.relationships);
    setActiveTab('canvas');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewEntity={() => {
          setSelectedEntityForEdit(null);
          setIsEntityModalOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenAiTutor={() => setIsAiTutorModalOpen(true)}
        errorCount={errorCount}
        totalScore={rubric.totalScore}
      />

      {/* Main Tab Content Display */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'canvas' && (
          <Canvas
            entities={entities}
            relationships={relationships}
            notation={notation}
            setNotation={setNotation}
            issues={issues}
            onUpdateEntityPosition={handleUpdateEntityPosition}
            onEditEntity={(ent) => {
              setSelectedEntityForEdit(ent);
              setIsEntityModalOpen(true);
            }}
            onDeleteEntity={handleDeleteEntity}
            onEditRelationship={(rel) => {
              setSelectedRelationshipForEdit(rel);
              setConnectSourceId(null);
              setConnectTargetId(null);
              setIsRelationshipModalOpen(true);
            }}
            onDeleteRelationship={handleDeleteRelationship}
            onStartConnect={handleStartConnect}
            connectingSourceId={connectSourceId}
            onCompleteConnect={handleCompleteConnect}
            onCancelConnect={handleCancelConnect}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationPanel
            issues={issues}
            rubric={rubric}
            currentModel={currentModel}
            setCurrentModel={setCurrentModel}
            onApplyFix={handleApplyFix}
            entities={entities}
            relationships={relationships}
          />
        )}

        {activeTab === 'multimodel' && (
          <MultiModelViewer
            entities={entities}
            relationships={relationships}
            initialModel={currentModel}
          />
        )}

        {activeTab === 'challenges' && (
          <div className="p-6">
            <ChallengeModal
              isOpen={true}
              onClose={() => setActiveTab('canvas')}
              onLoadChallenge={handleLoadChallenge}
              activeChallengeId={activeChallengeId}
              currentScore={rubric.totalScore}
              currentErrorCount={errorCount}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="p-6">
            <VocationalGuideModal
              isOpen={true}
              onClose={() => setActiveTab('canvas')}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <EntityModal
        entity={selectedEntityForEdit}
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        onSave={handleSaveEntity}
      />

      <RelationshipModal
        relationship={selectedRelationshipForEdit}
        entities={entities}
        isOpen={isRelationshipModalOpen}
        onClose={() => {
          setIsRelationshipModalOpen(false);
          setSelectedRelationshipForEdit(null);
          setConnectSourceId(null);
          setConnectTargetId(null);
        }}
        onSave={handleSaveRelationship}
        onDelete={handleDeleteRelationship}
        initialSourceId={connectSourceId || undefined}
        initialTargetId={connectTargetId || undefined}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      <AiTutorModal
        isOpen={isAiTutorModalOpen}
        onClose={() => setIsAiTutorModalOpen(false)}
        entities={entities}
        relationships={relationships}
      />
    </div>
  );
}
