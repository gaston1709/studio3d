"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrderFile {
  id: string;
  fileName: string;
  filePath: string;
  material: { name: string } | null;
  color: { name: string; hexCode: string } | null;
  customMaterial: string | null;
  customColor: string | null;
}

interface Order {
  id: string;
  status: string;
  printTimeEstimated: number | null;
  user: { email: string };
  files: OrderFile[];
}

function SortableItem({ order, index }: { order: Order; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const displayFileName = order.files && order.files.length > 0 
    ? (order.files.length > 1 ? `${order.files[0].fileName} (+${order.files.length - 1})` : order.files[0].fileName)
    : "Sin archivo";

  const isPrinting = order.status === "PRINTING";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-6 p-5 rounded-2xl border transition-all shadow-sm mb-4 ${
        isPrinting
          ? "bg-[var(--graphite)] border-[var(--amber)] text-[var(--paper)]"
          : "bg-white/60 border-[var(--paper-line)] text-[var(--ink)]"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className={`cursor-grab active:cursor-grabbing p-2 rounded-lg ${
          isPrinting ? 'text-[var(--paper)]/50 hover:bg-white/10' : 'text-[var(--ink-soft)]/50 hover:bg-white/40'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
        isPrinting ? "bg-[var(--amber)] text-[var(--graphite)] shadow-md" : "bg-[var(--graphite)] text-[var(--paper)]"
      }`}>
        {isPrinting ? "⚡" : index + 1}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-3">
          <p className={`font-semibold tracking-tight truncate ${isPrinting ? 'text-white' : 'text-[var(--ink)]'}`}>{displayFileName}</p>
          <span className={`mono text-[8px] px-2 py-0.5 rounded border uppercase tracking-widest font-semibold ${
            isPrinting ? "bg-[var(--amber)]/20 text-[var(--amber)] border-[var(--amber)]/40" : "bg-[var(--paper)] text-[var(--ink-soft)] border-[var(--paper-line)]"
          }`}>
            {isPrinting ? "PROCESANDO" : "EN COLA"}
          </span>
        </div>
        <p className={`mono text-[9px] uppercase tracking-wider mt-1 truncate ${isPrinting ? 'text-[var(--paper)]/60' : 'text-[var(--ink-soft)]'}`}>
          {order.user.email} • {order.files && order.files.length > 0
            ? (order.files.length > 1 
                ? "Varios" 
                : `${order.files[0].material?.name || order.files[0].customMaterial || 'Especial'} ${order.files[0].color?.name || order.files[0].customColor || 'Especial'}`)
            : "Especial"
          }
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={`mono text-[8px] uppercase tracking-[0.2em] mb-0.5 ${isPrinting ? 'text-[var(--paper)]/40' : 'text-[var(--ink-soft)]'}`}>Ciclo</p>
        <p className={`font-semibold text-lg tracking-tight ${isPrinting ? 'text-white' : 'text-[var(--ink)]'}`}>{order.printTimeEstimated || 0}h</p>
      </div>
    </div>
  );
}

export default function QueueManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orders.findIndex((o) => o.id === active.id);
      const newIndex = orders.findIndex((o) => o.id === over.id);

      const newOrders = arrayMove(orders, oldIndex, newIndex);
      setOrders(newOrders);

      setIsSaving(true);
      try {
        await fetch("/api/admin/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds: newOrders.map((o) => o.id) }),
        });
      } catch {
        console.error("Failed to save queue order");
      } finally {
        setIsSaving(false);
      }
    }
  }

  const totalHours = orders.reduce((acc, order) => acc + (order.printTimeEstimated || 0), 0);
  const daysEstimated = Math.ceil(totalHours / 12);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--graphite)] p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[140px]">
            <p className="mono text-[9px] text-[var(--paper)]/50 uppercase tracking-[0.25em]">Carga Operativa Total</p>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-semibold text-white tracking-tight">{totalHours.toFixed(1)}</p>
               <span className="mono text-[10px] text-[var(--paper)]/40 uppercase tracking-widest">Horas</span>
            </div>
          </div>
          <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 flex flex-col justify-between min-h-[140px]">
            <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em]">Pipeline de Entrega</p>
            <div className="flex items-baseline gap-2">
               <span className="mono text-xl text-[var(--ink-soft)]/50">~</span>
               <p className="text-5xl font-semibold text-[var(--ink)] tracking-tight">{daysEstimated}</p>
               <span className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Días</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[color-mix(in_srgb,var(--amber)_5%,white)] border border-[var(--paper-line)] p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
           <h3 className="mono text-[9px] text-[var(--amber)] uppercase tracking-[0.25em]">Estado de Red</h3>
           <div className="flex items-center gap-2 pt-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isSaving ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`} />
              <p className="mono text-xs font-semibold text-[var(--ink)] uppercase tracking-widest">
                {isSaving ? "Sincronizando..." : "Sincronizado"}
              </p>
           </div>
           <p className="mono text-[8px] text-[var(--ink-soft)] mt-4 leading-normal uppercase">
             El orden de manufactura impacta directamente en las fechas de los clientes.
           </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] pl-3 border-l-2 border-[var(--amber)]">Prioridad de Producción (Drag & Drop)</h2>

        {orders.length === 0 ? (
          <div className="py-20 text-center bg-white/20 border border-dashed border-[var(--paper-line)] rounded-3xl">
            <p className="mono text-xs text-[var(--ink-soft)] uppercase tracking-widest italic">Cola de manufactura despejada</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orders} strategy={verticalListSortingStrategy}>
              {orders.map((order, index) => (
                <SortableItem key={order.id} order={order} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
