import React, { useState, useRef, useEffect } from 'react';
import {
  Entity,
  Relationship,
  DiagramNotation,
  ValidationIssue,
} from '../types/database';
import {
  Key,
  Link2,
  Trash2,
  Edit2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Download,
  Share2,
  AlertCircle,
  Layers,
  Shapes,
  Sparkles,
} from 'lucide-react';

interface CanvasProps {
  entities: Entity[];
  relationships: Relationship[];
  notation: DiagramNotation;
  setNotation: (n: DiagramNotation) => void;
  issues: ValidationIssue[];
  onUpdateEntityPosition: (id: string, x: number, y: number) => void;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (id: string) => void;
  onEditRelationship: (relationship: Relationship) => void;
  onDeleteRelationship: (id: string) => void;
  onStartConnect: (sourceId: string) => void;
  connectingSourceId: string | null;
  onCompleteConnect: (targetId: string) => void;
  onCancelConnect: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  entities,
  relationships,
  notation,
  setNotation,
  issues,
  onUpdateEntityPosition,
  onEditEntity,
  onDeleteEntity,
  onEditRelationship,
  onDeleteRelationship,
  onStartConnect,
  connectingSourceId,
  onCompleteConnect,
  onCancelConnect,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Entities with issues mapped by ID for visual highlight
  const entityErrors = new Set<string>();
  const entityWarnings = new Set<string>();
  const relErrors = new Set<string>();

  issues.forEach((issue) => {
    if (issue.severity === 'error') {
      issue.affectedEntityIds.forEach((id) => entityErrors.add(id));
      issue.affectedRelationshipIds.forEach((id) => relErrors.add(id));
    } else if (issue.severity === 'warning') {
      issue.affectedEntityIds.forEach((id) => entityWarnings.add(id));
    }
  });

  // Handle Dragging Entities
  const handleEntityMouseDown = (e: React.MouseEvent, entity: Entity) => {
    e.stopPropagation();
    if (connectingSourceId) {
      if (connectingSourceId !== entity.id) {
        onCompleteConnect(entity.id);
      }
      return;
    }

    setDraggingEntityId(entity.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({
        x: mouseX - entity.x,
        y: mouseY - entity.y,
      });
    }
  };

  // Canvas Pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      if (connectingSourceId) {
        onCancelConnect();
        return;
      }
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingEntityId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        const newX = Math.max(20, Math.round(mouseX - dragOffset.x));
        const newY = Math.max(20, Math.round(mouseY - dragOffset.y));
        onUpdateEntityPosition(draggingEntityId, newX, newY);
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingEntityId(null);
    setIsPanning(false);
  };

  // Auto layout function
  const handleAutoAlign = () => {
    const cols = Math.max(2, Math.ceil(Math.sqrt(entities.length)));
    const colWidth = 320;
    const rowHeight = 280;

    entities.forEach((entity, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      onUpdateEntityPosition(entity.id, 80 + col * colWidth, 60 + row * rowHeight);
    });
  };

  // Export Diagram as SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `er-diagram-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-[calc(100vh-62px)] flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Canvas Floating Top Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Notation Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setNotation('crows_foot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              notation === 'crows_foot'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Crow's Foot (ตาราง)</span>
          </button>
          <button
            onClick={() => setNotation('chen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              notation === 'chen'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>Chen (ข้าวหลามตัด)</span>
          </button>
        </div>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        {/* Zoom & Alignment buttons */}
        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
          title="ซูมเข้า (+)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono tabular-nums text-slate-600 px-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          title="ซูมออก (-)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="รีเซ็ตมุมมอง (100%)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          title="เปิด/ปิดเส้นตาราง Grid"
          className={`p-1.5 rounded-lg transition-colors ${
            showGrid ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={handleAutoAlign}
          title="จัดเรียงตำแหน่งอัตโนมัติ"
          className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>จัดเรียงสวยงาม</span>
        </button>

        <button
          onClick={handleExportSVG}
          title="ส่งออกเป็นรูปภาพ SVG"
          className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>ส่งออก SVG</span>
        </button>
      </div>

      {/* Connection Mode Helper Notification */}
      {connectingSourceId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg animate-bounce">
          <Link2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">
            คลิกที่ตารางปลายทาง เพื่อสร้างเส้นความสัมพันธ์ หรือคลิกพื้นที่ว่างเพื่อยกเลิก
          </span>
          <button
            onClick={onCancelConnect}
            className="text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-0.5 rounded-md font-semibold"
          >
            ยกเลิก
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden ${
          showGrid ? 'canvas-bg-grid' : 'bg-slate-100'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '4000px',
            height: '4000px',
            position: 'absolute',
          }}
        >
          {/* SVG Layer for Relationship Paths and Chen Elements */}
          <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            width="4000"
            height="4000"
          >
            <defs>
              {/* Arrow and Crow's foot markers */}
              <marker
                id="arrow-end"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Relationships Lines */}
            {relationships.map((rel) => {
              const source = entities.find((e) => e.id === rel.sourceEntityId);
              const target = entities.find((e) => e.id === rel.targetEntityId);
              if (!source || !target) return null;

              // Estimate dimensions of table cards
              const sWidth = 240;
              const sHeight = Math.max(120, 48 + source.attributes.length * 28);
              const tWidth = 240;
              const tHeight = Math.max(120, 48 + target.attributes.length * 28);

              // Center coordinates
              const sX = source.x + sWidth / 2;
              const sY = source.y + sHeight / 2;
              const tX = target.x + tWidth / 2;
              const tY = target.y + tHeight / 2;

              const isRelError = relErrors.has(rel.id);
              const isNM = rel.cardinality === 'N:M';

              // Midpoint for relationship label
              const midX = (sX + tX) / 2;
              const midY = (sY + tY) / 2;

              // Quadratic or cubic curve control points
              const dx = tX - sX;
              const dy = tY - sY;
              const cx1 = sX + dx * 0.5;
              const cy1 = sY;
              const cx2 = sX + dx * 0.5;
              const cy2 = tY;

              const pathD = `M ${sX} ${sY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tX} ${tY}`;

              return (
                <g key={rel.id} className="pointer-events-auto group">
                  {/* Outer glow line for error highlight */}
                  {isRelError && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      strokeDasharray="6 4"
                    />
                  )}

                  {/* Main connecting path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isRelError ? '#e11d48' : '#64748b'}
                    strokeWidth={isNM ? '2.5' : '2'}
                    strokeDasharray={isNM ? '5 5' : undefined}
                    className="hover:stroke-indigo-600 transition-colors cursor-pointer"
                    onClick={() => onEditRelationship(rel)}
                  />

                  {/* Relationship Badge Label in the Middle */}
                  <foreignObject
                    x={midX - 70}
                    y={midY - 18}
                    width="140"
                    height="36"
                    className="overflow-visible"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRelationship(rel);
                      }}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer shadow-md transition-all transform hover:scale-105 ${
                        isNM
                          ? 'bg-rose-50 border-2 border-rose-500 text-rose-800'
                          : 'bg-white border border-slate-300 text-slate-800 hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                    >
                      <span className="font-mono text-[10px] px-1 rounded bg-slate-100 text-slate-700">
                        {rel.cardinality}
                      </span>
                      <span className="truncate max-w-[80px]" title={rel.thaiName || rel.name}>
                        {rel.thaiName || rel.name}
                      </span>
                      {isRelError && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    </div>
                  </foreignObject>

                  {/* Chen Diamond Notation Visual if Chen notation is enabled */}
                  {notation === 'chen' && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <polygon
                        points="0,-20 30,0 0,20 -30,0"
                        fill="#f8fafc"
                        stroke={isRelError ? '#e11d48' : '#4f46e5'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => onEditRelationship(rel)}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#1e293b"
                        className="pointer-events-none"
                      >
                        {rel.cardinality}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML Layer for Entity Cards (Crow's Foot style or Chen Style) */}
          {entities.map((entity) => {
            const hasError = entityErrors.has(entity.id);
            const hasWarning = entityWarnings.has(entity.id);
            const isConnecting = connectingSourceId === entity.id;

            return (
              <div
                key={entity.id}
                onMouseDown={(e) => handleEntityMouseDown(e, entity)}
                style={{
                  left: `${entity.x}px`,
                  top: `${entity.y}px`,
                  width: '240px',
                }}
                className={`absolute rounded-xl bg-white transition-shadow duration-150 cursor-grab active:cursor-grabbing border ${
                  isConnecting
                    ? 'ring-4 ring-indigo-400 border-indigo-600 shadow-xl'
                    : hasError
                    ? 'border-rose-400 ring-2 ring-rose-300 shadow-lg'
                    : hasWarning
                    ? 'border-amber-400 ring-1 ring-amber-200 shadow-md'
                    : 'border-slate-200/90 shadow-md hover:shadow-lg hover:border-indigo-300'
                }`}
              >
                {/* Entity Header */}
                <div
                  style={{
                    backgroundColor: entity.color || '#4f46e5',
                  }}
                  className="px-3.5 py-2 rounded-t-xl text-white flex items-center justify-between"
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-bold font-mono tracking-tight truncate">
                      {entity.name}
                    </span>
                    <span className="text-[10px] text-white/90 truncate">
                      {entity.thaiName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartConnect(entity.id);
                      }}
                      title="โยงความสัมพันธ์ไปยังตารางอื่น"
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEntity(entity);
                      }}
                      title="แก้ไขตารางและคอลัมน์"
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntity(entity.id);
                      }}
                      title="ลบตารางนี้"
                      className="p-1 hover:bg-white/20 rounded transition-colors text-white/80 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attributes List */}
                <div className="divide-y divide-slate-100 text-xs">
                  {entity.attributes.length === 0 ? (
                    <div className="p-3 text-[11px] text-slate-400 text-center italic">
                      ยังไม่มีคอลัมน์ คลิกไอคอนดินสอเพื่อเพิ่ม
                    </div>
                  ) : (
                    entity.attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className={`flex items-center justify-between px-3 py-1.5 transition-colors ${
                          attr.isPrimary
                            ? 'bg-amber-50/70 font-medium'
                            : attr.isForeign
                            ? 'bg-blue-50/50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {attr.isPrimary ? (
                            <span title="Primary Key (คีย์หลัก)">
                              <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </span>
                          ) : attr.isForeign ? (
                            <span
                              className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1 py-0.2 rounded shrink-0"
                              title="Foreign Key (คีย์นอก)"
                            >
                              FK
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center text-slate-300">
                              •
                            </span>
                          )}

                          <span
                            className={`truncate ${
                              attr.isPrimary
                                ? 'text-amber-900 font-semibold underline decoration-amber-400 decoration-1 underline-offset-2'
                                : 'text-slate-700'
                            }`}
                            title={`${attr.name} (${attr.thaiName || ''})`}
                          >
                            {attr.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400">
                          <span>{attr.type}</span>
                          {attr.lengthOrPrecision && <span>({attr.lengthOrPrecision})</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Quick Status Bar */}
                <div className="px-3 py-1.5 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{entity.attributes.length} คอลัมน์</span>
                  {hasError ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> ขาด PK หรือชื่อซ้ำ
                    </span>
                  ) : (
                    <span>พร้อมใช้งาน</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
