import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Trash2,
  Copy,
  Type,
  Plus,
  Minus,
  Move,
  Check,
  X,
  Layers,
  Calendar,
} from 'lucide-react';
import { Placement } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface OverlayCanvasProps {
  pageNumber: number;
  scale: number; // current zoom scale (e.g. 0.6, 1.0, 1.5)
  pageWidth: number; // native PDF page width in points (e.g. 595.28)
  pageHeight: number; // native PDF page height in points (e.g. 841.89)
  renderedWidth: number; // CSS pixels width (pageWidth * scale)
  renderedHeight: number; // CSS pixels height (pageHeight * scale)
  placements: Placement[]; // coordinates stored in canonical PDF points!
  onUpdatePlacement: (placement: Placement) => void;
  onUpdateMultiplePlacements?: (placements: Placement[]) => void;
  onDeletePlacement: (id: string) => void;
  onDuplicatePlacement: (placement: Placement) => void;
  selectedId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onCanvasClickToPlace?: (x: number, y: number) => void;
  activeTool?: string | null;
}

const SWATCHES = ['#003366', '#000000', '#16a34a', '#dc2626', '#1e40af'];

export const getFormattedDateByPattern = (
  pattern: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'LONG_ES' | 'SHORT_ES',
  lang: 'es' | 'en' | 'zh' = 'es'
): string => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();

  if (pattern === 'DD/MM/YYYY') return `${d}/${m}/${y}`;
  if (pattern === 'DD-MM-YYYY') return `${d}-${m}-${y}`;
  if (pattern === 'YYYY-MM-DD') return `${y}-${m}-${d}`;

  const locale = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'es-ES';
  if (pattern === 'SHORT_ES') {
    return now.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
};

interface ActiveDragSession {
  type: 'single' | 'group';
  pointerId: number;
  startX: number;
  startY: number;
  // For single item:
  targetItem?: Placement;
  startItemPtX?: number;
  startItemPtY?: number;
  // For group box:
  groupId?: string;
  initialItems?: { id: string; x: number; y: number; width: number; height: number }[];
}

interface ActiveResizeSession {
  pointerId: number;
  startX: number;
  startY: number;
  handle: 'se' | 'sw' | 'ne' | 'nw';
  targetItem: Placement;
  initialPtX: number;
  initialPtY: number;
  initialWidthPt: number;
  initialHeightPt: number;
  aspectRatio: number;
}

export const OverlayCanvas: React.FC<OverlayCanvasProps> = ({
  pageNumber,
  scale,
  pageWidth,
  pageHeight,
  renderedWidth,
  renderedHeight,
  placements,
  onUpdatePlacement,
  onUpdateMultiplePlacements,
  onDeletePlacement,
  onDuplicatePlacement,
  selectedId,
  onSelectPlacement,
  onCanvasClickToPlace,
  activeTool,
}) => {
  const { t, language } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active pointer sessions
  const dragSessionRef = useRef<ActiveDragSession | null>(null);
  const resizeSessionRef = useRef<ActiveResizeSession | null>(null);

  const [isDraggingAny, setIsDraggingAny] = useState<boolean>(false);
  const [activeGroupIdDragging, setActiveGroupIdDragging] = useState<string | null>(null);

  // In-line editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>('');

  const selectedPlacement = placements.find((p) => p.id === selectedId);

  // Calculate grouped boxes for this page in native points and screen coordinates
  const groupsData = useMemo(() => {
    const map = new Map<string, Placement[]>();
    for (const p of placements) {
      if (p.groupId) {
        if (!map.has(p.groupId)) map.set(p.groupId, []);
        map.get(p.groupId)!.push(p);
      }
    }

    const result = [];
    for (const [gId, items] of map.entries()) {
      if (items.length === 0) continue;
      const minPtX = Math.min(...items.map((i) => i.x));
      const minPtY = Math.min(...items.map((i) => i.y));
      const maxPtX = Math.max(...items.map((i) => i.x + i.width));
      const maxPtY = Math.max(...items.map((i) => i.y + i.height));
      const padPt = 6;

      const boxPtX = Math.max(0, minPtX - padPt);
      const boxPtY = Math.max(0, minPtY - padPt);
      const boxPtWidth = Math.min(pageWidth, maxPtX - minPtX + padPt * 2);
      const boxPtHeight = Math.min(pageHeight, maxPtY - minPtY + padPt * 2);

      result.push({
        groupId: gId,
        groupName: items[0].groupName || 'Caja de Datos',
        items,
        screenX: Math.round(boxPtX * scale),
        screenY: Math.round(boxPtY * scale),
        screenWidth: Math.round(boxPtWidth * scale),
        screenHeight: Math.round(boxPtHeight * scale),
      });
    }
    return result;
  }, [placements, scale, pageWidth, pageHeight]);

  // Keyboard navigation & deletion listener (nudge in native points)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;

      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeletePlacement(selectedId);
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        if (!selectedPlacement) return;
        e.preventDefault();
        const delta = e.shiftKey ? 8 : 1.5;
        let newX = selectedPlacement.x;
        let newY = selectedPlacement.y;

        if (e.key === 'ArrowLeft') newX = Math.max(0, newX - delta);
        if (e.key === 'ArrowRight')
          newX = Math.min(pageWidth - selectedPlacement.width, newX + delta);
        if (e.key === 'ArrowUp') newY = Math.max(0, newY - delta);
        if (e.key === 'ArrowDown')
          newY = Math.min(pageHeight - selectedPlacement.height, newY + delta);

        onUpdatePlacement({
          ...selectedPlacement,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (e.key === 'Escape') {
        onSelectPlacement(null);
        setEditingId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedId,
    selectedPlacement,
    pageWidth,
    pageHeight,
    onDeletePlacement,
    onUpdatePlacement,
    onSelectPlacement,
  ]);

  // Click on background canvas to deselect or place
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== containerRef.current) return;
    if (activeTool && onCanvasClickToPlace) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickScreenX = e.clientX - rect.left;
      const clickScreenY = e.clientY - rect.top;
      const ptX = Math.round(clickScreenX / scale);
      const ptY = Math.round(clickScreenY / scale);
      onCanvasClickToPlace(ptX, ptY);
    } else {
      onSelectPlacement(null);
      setEditingId(null);
    }
  };

  // ----------------------------------------------------
  // POINTER EVENT HANDLERS: Move Single Item ("cada dato")
  // ----------------------------------------------------
  const handleItemPointerDown = (
    e: React.PointerEvent,
    item: Placement,
    forceGroupDrag = false
  ) => {
    if (editingId === item.id) return;
    e.stopPropagation();
    onSelectPlacement(item.id);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    if (forceGroupDrag && item.groupId) {
      const groupItems = placements.filter((p) => p.groupId === item.groupId);
      dragSessionRef.current = {
        type: 'group',
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        groupId: item.groupId,
        initialItems: groupItems.map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
        })),
      };
      setActiveGroupIdDragging(item.groupId);
    } else {
      dragSessionRef.current = {
        type: 'single',
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        targetItem: item,
        startItemPtX: item.x,
        startItemPtY: item.y,
      };
    }
    setIsDraggingAny(true);
  };

  // ----------------------------------------------------
  // POINTER EVENT HANDLERS: Move Entire Box ("caja entera")
  // ----------------------------------------------------
  const handleGroupPointerDown = (
    e: React.PointerEvent,
    groupId: string,
    items: Placement[]
  ) => {
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragSessionRef.current = {
      type: 'group',
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      groupId,
      initialItems: items.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
      })),
    };

    setIsDraggingAny(true);
    setActiveGroupIdDragging(groupId);
  };

  // ----------------------------------------------------
  // POINTER EVENT HANDLERS: Resize Handle with Canonical Points
  // ----------------------------------------------------
  const handleResizePointerDown = (
    e: React.PointerEvent,
    handle: 'se' | 'sw' | 'ne' | 'nw',
    item: Placement
  ) => {
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    resizeSessionRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      handle,
      targetItem: item,
      initialPtX: item.x,
      initialPtY: item.y,
      initialWidthPt: item.width,
      initialHeightPt: item.height,
      aspectRatio: item.width / item.height,
    };
  };

  // ----------------------------------------------------
  // GLOBAL POINTER MOVE: Coordinate conversion with scale
  // ----------------------------------------------------
  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Moving an item or an entire box
    const dragSession = dragSessionRef.current;
    if (dragSession && dragSession.pointerId === e.pointerId) {
      const deltaScreenX = e.clientX - dragSession.startX;
      const deltaScreenY = e.clientY - dragSession.startY;

      // Convert delta from screen pixels to native PDF points!
      const deltaPtX = deltaScreenX / scale;
      const deltaPtY = deltaScreenY / scale;

      if (
        dragSession.type === 'single' &&
        dragSession.targetItem &&
        dragSession.startItemPtX !== undefined &&
        dragSession.startItemPtY !== undefined
      ) {
        let newX = dragSession.startItemPtX + deltaPtX;
        let newY = dragSession.startItemPtY + deltaPtY;
        newX = Math.max(0, Math.min(pageWidth - dragSession.targetItem.width, newX));
        newY = Math.max(0, Math.min(pageHeight - dragSession.targetItem.height, newY));

        onUpdatePlacement({
          ...dragSession.targetItem,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (
        dragSession.type === 'group' &&
        dragSession.initialItems &&
        dragSession.initialItems.length > 0
      ) {
        let clampDx = deltaPtX;
        let clampDy = deltaPtY;

        for (const it of dragSession.initialItems) {
          const proposedX = it.x + clampDx;
          const proposedY = it.y + clampDy;
          if (proposedX < 0) clampDx = Math.max(clampDx, -it.x);
          if (proposedX + it.width > pageWidth)
            clampDx = Math.min(clampDx, pageWidth - it.width - it.x);
          if (proposedY < 0) clampDy = Math.max(clampDy, -it.y);
          if (proposedY + it.height > pageHeight)
            clampDy = Math.min(clampDy, pageHeight - it.height - it.y);
        }

        const updatedList: Placement[] = dragSession.initialItems.map((it) => {
          const existing = placements.find((p) => p.id === it.id);
          return {
            ...(existing || it),
            id: it.id,
            x: Math.round((it.x + clampDx) * 10) / 10,
            y: Math.round((it.y + clampDy) * 10) / 10,
          } as Placement;
        });

        if (onUpdateMultiplePlacements) {
          onUpdateMultiplePlacements(updatedList);
        } else {
          updatedList.forEach((it) => onUpdatePlacement(it));
        }
      }
      return;
    }

    // 2. Resizing with Auto-Font Fit (prevents text/date from disappearing)
    const resizeSession = resizeSessionRef.current;
    if (resizeSession && resizeSession.pointerId === e.pointerId) {
      const deltaScreenX = e.clientX - resizeSession.startX;
      const deltaScreenY = e.clientY - resizeSession.startY;

      const deltaPtX = deltaScreenX / scale;
      const deltaPtY = deltaScreenY / scale;

      const isSignature = resizeSession.targetItem.type === 'signature';
      let newWidthPt = resizeSession.initialWidthPt;
      let newHeightPt = resizeSession.initialHeightPt;
      let newPtX = resizeSession.initialPtX;
      let newPtY = resizeSession.initialPtY;

      if (resizeSession.handle === 'se') {
        newWidthPt = Math.max(20, resizeSession.initialWidthPt + deltaPtX);
        if (isSignature) {
          newHeightPt = newWidthPt / resizeSession.aspectRatio;
        } else {
          newHeightPt = Math.max(12, resizeSession.initialHeightPt + deltaPtY);
        }
      } else if (resizeSession.handle === 'sw') {
        newWidthPt = Math.max(20, resizeSession.initialWidthPt - deltaPtX);
        newPtX =
          resizeSession.initialPtX +
          (resizeSession.initialWidthPt - newWidthPt);
        if (isSignature) {
          newHeightPt = newWidthPt / resizeSession.aspectRatio;
        } else {
          newHeightPt = Math.max(12, resizeSession.initialHeightPt + deltaPtY);
        }
      } else if (resizeSession.handle === 'ne') {
        newWidthPt = Math.max(20, resizeSession.initialWidthPt + deltaPtX);
        if (isSignature) {
          newHeightPt = newWidthPt / resizeSession.aspectRatio;
          newPtY =
            resizeSession.initialPtY +
            (resizeSession.initialHeightPt - newHeightPt);
        } else {
          newHeightPt = Math.max(12, resizeSession.initialHeightPt - deltaPtY);
          newPtY = resizeSession.initialPtY + deltaPtY;
        }
      } else if (resizeSession.handle === 'nw') {
        newWidthPt = Math.max(20, resizeSession.initialWidthPt - deltaPtX);
        newPtX =
          resizeSession.initialPtX +
          (resizeSession.initialWidthPt - newWidthPt);
        if (isSignature) {
          newHeightPt = newWidthPt / resizeSession.aspectRatio;
          newPtY =
            resizeSession.initialPtY +
            (resizeSession.initialHeightPt - newHeightPt);
        } else {
          newHeightPt = Math.max(12, resizeSession.initialHeightPt - deltaPtY);
          newPtY = resizeSession.initialPtY + deltaPtY;
        }
      }

      const updateData: Partial<Placement> = {
        x: Math.round(Math.max(0, Math.min(pageWidth - newWidthPt, newPtX)) * 10) / 10,
        y: Math.round(Math.max(0, Math.min(pageHeight - newHeightPt, newPtY)) * 10) / 10,
        width: Math.round(newWidthPt * 10) / 10,
        height: Math.round(newHeightPt * 10) / 10,
      };

      // Auto-fit font size so date and text never disappear when shrunk
      if (
        !isSignature &&
        (resizeSession.targetItem.type === 'text' ||
          resizeSession.targetItem.type === 'date')
      ) {
        const textLen = Math.max(1, (resizeSession.targetItem.content || '').length);
        const fitByWidth = Math.floor((newWidthPt - 4) / (textLen * 0.54));
        const fitByHeight = Math.floor(newHeightPt * 0.74);
        const autoFontSize = Math.max(6, Math.min(36, Math.min(fitByWidth, fitByHeight)));
        updateData.fontSize = autoFontSize;
      }

      onUpdatePlacement({
        ...resizeSession.targetItem,
        ...updateData,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (
      dragSessionRef.current &&
      dragSessionRef.current.pointerId === e.pointerId
    ) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragSessionRef.current = null;
      setIsDraggingAny(false);
      setActiveGroupIdDragging(null);
    }

    if (
      resizeSessionRef.current &&
      resizeSessionRef.current.pointerId === e.pointerId
    ) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      resizeSessionRef.current = null;
    }
  };

  // Cycle date format with 1 tap and auto-size to fit
  const cycleDateFormat = (item: Placement) => {
    const patterns: Array<
      'DD/MM/YYYY' | 'DD-MM-YYYY' | 'LONG_ES' | 'YYYY-MM-DD' | 'SHORT_ES'
    > = ['DD/MM/YYYY', 'DD-MM-YYYY', 'LONG_ES', 'YYYY-MM-DD', 'SHORT_ES'];

    const currentContent = item.content || '';
    let nextIndex = 0;
    for (let i = 0; i < patterns.length; i++) {
      if (getFormattedDateByPattern(patterns[i]) === currentContent) {
        nextIndex = (i + 1) % patterns.length;
        break;
      }
    }

    const nextPattern = patterns[nextIndex];
    const newText = getFormattedDateByPattern(nextPattern, language);
    const fontSize = item.fontSize || 12;
    const estimatedWidth = Math.max(
      60,
      Math.round(newText.length * (fontSize * 0.58) + 10)
    );

    onUpdatePlacement({
      ...item,
      content: newText,
      width: Math.min(pageWidth - item.x, estimatedWidth),
    });
  };

  // Inline text editing
  const startEditing = (placement: Placement) => {
    if (
      placement.type === 'signature' ||
      placement.type === 'check' ||
      placement.type === 'cross'
    )
      return;
    setEditingId(placement.id);
    setTempText(placement.content || '');
  };

  const commitEditing = (placement: Placement) => {
    onUpdatePlacement({
      ...placement,
      content: tempText,
    });
    setEditingId(null);
  };

  const adjustFontSize = (placement: Placement, delta: number) => {
    const current = placement.fontSize || 13;
    const next = Math.max(6, Math.min(48, current + delta));
    onUpdatePlacement({
      ...placement,
      fontSize: next,
    });
  };

  const changeColor = (placement: Placement, color: string) => {
    onUpdatePlacement({
      ...placement,
      color,
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBackgroundClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: `${renderedWidth}px`,
        height: `${renderedHeight}px`,
        touchAction: isDraggingAny ? 'none' : 'pan-x pan-y',
      }}
      className={`absolute inset-0 select-none overflow-hidden ${
        activeTool ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* ------------------------------------------------------- */}
      {/* 1. VISIBLE GROUP BOXES: "Mover caja entera" */}
      {/* ------------------------------------------------------- */}
      {groupsData.map((group) => {
        const isGroupActive = activeGroupIdDragging === group.groupId;
        const isAnyItemSelectedInGroup = group.items.some(
          (it) => it.id === selectedId
        );

        return (
          <div
            key={group.groupId}
            style={{
              transform: `translate3d(${group.screenX}px, ${group.screenY}px, 0)`,
              width: `${group.screenWidth}px`,
              height: `${group.screenHeight}px`,
              touchAction: 'none',
            }}
            className={`absolute top-0 left-0 border-2 rounded-xl transition-all ${
              isGroupActive || isAnyItemSelectedInGroup
                ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-400/40'
                : 'border-dashed border-indigo-300 dark:border-indigo-700/80 bg-indigo-50/5 hover:border-indigo-400'
            }`}
          >
            {/* Header Handle: Drag Entire Box */}
            <div
              onPointerDown={(e) =>
                handleGroupPointerDown(e, group.groupId, group.items)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
              className="absolute -top-7 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-t-lg shadow-md text-[11px] font-bold cursor-grab active:cursor-grabbing select-none transition-colors z-30"
              title={t.canvasMoveEntireBox}
            >
              <Move className="w-3.5 h-3.5" />
              <span>{t.canvasMoveEntireBox}</span>
            </div>

            {/* Subtle group name label badge */}
            <div className="absolute bottom-1 right-2 text-[9px] text-indigo-400 dark:text-indigo-500 font-semibold pointer-events-none uppercase tracking-wider">
              {group.groupName}
            </div>
          </div>
        );
      })}

      {/* ------------------------------------------------------- */}
      {/* 2. INDIVIDUAL ITEMS: Positioned in screen pixels via scale */}
      {/* ------------------------------------------------------- */}
      {placements.map((item) => {
        const isSelected = item.id === selectedId;
        const isEditing = item.id === editingId;

        // Convert canonical native points to screen CSS pixels for display
        const screenX = Math.round(item.x * scale);
        const screenY = Math.round(item.y * scale);
        const screenWidth = Math.round(item.width * scale);
        const screenHeight = Math.round(item.height * scale);
        const screenFontSize = Math.max(6, Math.round((item.fontSize || 13) * scale));

        return (
          <div
            key={item.id}
            onPointerDown={(e) => handleItemPointerDown(e, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => startEditing(item)}
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              touchAction: 'none',
            }}
            className={`absolute top-0 left-0 transition-shadow group ${
              isSelected
                ? 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50/20 dark:bg-blue-900/20 shadow-lg z-20'
                : 'hover:ring-1 hover:ring-blue-300 z-10'
            } rounded-sm cursor-grab active:cursor-grabbing select-none`}
            title="Arrastra para mover este dato independientemente"
          >
            {/* ITEM CONTENT */}
            {item.type === 'signature' && item.content ? (
              <img
                src={item.content}
                alt="Firma"
                draggable={false}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : item.type === 'check' ? (
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <Check
                  className="w-full h-full stroke-[3]"
                  style={{ color: item.color || '#16a34a' }}
                />
              </div>
            ) : item.type === 'cross' ? (
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <X
                  className="w-full h-full stroke-[3]"
                  style={{ color: item.color || '#dc2626' }}
                />
              </div>
            ) : isEditing ? (
              <input
                type="text"
                autoFocus
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                onBlur={() => commitEditing(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEditing(item);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="w-full h-full px-1 bg-white/95 dark:bg-zinc-800/95 border border-blue-500 rounded-sm text-zinc-900 dark:text-zinc-100 outline-hidden font-sans shadow-xs"
                style={{
                  fontSize: `${screenFontSize}px`,
                  color: item.color || '#003366',
                  fontWeight: item.isBold ? 'bold' : 'normal',
                }}
              />
            ) : (
              /* NON-DISAPPEARING TEXT / DATE CONTAINER */
              <div
                className="w-full h-full flex items-center justify-center text-center font-sans whitespace-nowrap overflow-visible pointer-events-none px-0.5 leading-none"
                style={{
                  fontSize: `${screenFontSize}px`,
                  color: item.color || '#003366',
                  fontWeight: item.isBold ? 'bold' : 'normal',
                }}
              >
                {item.content || '(Vacío)'}
              </div>
            )}

            {/* SELECTION RESIZE HANDLES & FLOATING ACTIONS */}
            {isSelected && (
              <>
                {/* 4 Corner Resize Handles */}
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, 'nw', item)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md z-30 touch-none"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, 'ne', item)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md z-30 touch-none"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, 'sw', item)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md z-30 touch-none"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, 'se', item)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md z-30 touch-none"
                />

                {/* Floating Quick Action Bar */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/95 text-white rounded-xl shadow-2xl backdrop-blur-md text-xs z-40 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* If item belongs to a group: Option to drag the whole box directly */}
                  {item.groupId && (
                    <>
                      <div
                        onPointerDown={(e) =>
                          handleItemPointerDown(e, item, true)
                        }
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        style={{ touchAction: 'none' }}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold cursor-grab active:cursor-grabbing text-[11px]"
                        title={t.canvasMoveBox}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{t.canvasMoveBox}</span>
                      </div>
                      <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                    </>
                  )}

                  {/* DATE FORMAT SELECTOR / CYCLER */}
                  {item.type === 'date' && (
                    <>
                      <button
                        onClick={() => cycleDateFormat(item)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600/90 hover:bg-blue-600 rounded-lg text-white font-bold text-[11px] cursor-pointer transition-colors"
                        title={t.canvasDateFormat}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t.canvasDateFormat}</span>
                      </button>
                      <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                    </>
                  )}

                  {/* Text Edit Button */}
                  {(item.type === 'text' ||
                    item.type === 'date' ||
                    item.type === 'id_badge') && (
                    <>
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer"
                        title={t.canvasEditText}
                      >
                        <Type className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                      <button
                        onClick={() => adjustFontSize(item, -1)}
                        className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer"
                        title={t.canvasReduceFont}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-zinc-400 font-mono px-0.5">
                        {item.fontSize || 13}
                      </span>
                      <button
                        onClick={() => adjustFontSize(item, 1)}
                        className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer"
                        title={t.canvasIncreaseFont}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                    </>
                  )}

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1 px-1">
                    {SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        onClick={() => changeColor(item, swatch)}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          item.color === swatch
                            ? 'scale-125 border-white ring-1 ring-blue-400'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>

                  <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />

                  {/* Duplicate Button */}
                  <button
                    onClick={() => onDuplicatePlacement(item)}
                    className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer"
                    title={t.canvasDuplicate}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeletePlacement(item.id)}
                    className="p-1 hover:bg-red-900/80 rounded-md transition-colors text-red-400 hover:text-red-200 cursor-pointer"
                    title={t.canvasDelete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
