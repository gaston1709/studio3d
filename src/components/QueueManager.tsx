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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-6 p-6 rounded-2xl border transition-all shadow-sm mb-4 ${
        order.status === "PRINTING"
          ? "bg-blue-600 border-blue-400 ring-4 ring-blue-100"
          : "bg-white border-slate-100"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className={`cursor-grab active:cursor-grabbing p-2 rounded-lg ${order.status === 'PRINTING' ? 'text-white/50 hover:bg-white/10' : 'text-slate-300 hover:bg-slate-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
        order.status === "PRINTING" ? "bg-white text-blue-600 shadow-xl" : "bg-[#0F1115] text-white"
      }`}>
        {order.status === "PRINTING" ? "⚡" : index + 1}
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-3">
          <p className={`font-bold tracking-tight ${order.status === 'PRINTING' ? 'text-white text-lg' : 'text-slate-900'}`}>{displayFileName}</p>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${
            order.status === "PRINTING" ? "bg-white/20 text-white border-white/30" : "bg-blue-50 text-blue-600 border-blue-100"
          }`}>
            {order.status === "PRINTING" ? "PROCESANDO" : "EN COLA"}
          </span>
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${order.status === 'PRINTING' ? 'text-white/70' : 'text-slate-400'}`}>
          {order.user.email} • {order.files && order.files.length > 0
            ? (order.files.length > 1 
                ? "Varios" 
                : `${order.files[0].material?.name || order.files[0].customMaterial || 'Especial'} ${order.files[0].color?.name || order.files[0].customColor || 'Especial'}`)
            : "Especial"
          }
        </p>
      </div>

      <div className="text-right">
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1 ${order.status === 'PRINTING' ? 'text-white/50' : 'text-slate-400'}`}>Ciclo</p>
        <p className={`font-black text-xl tracking-tighter ${order.status === 'PRINTING' ? 'text-white' : 'text-slate-900'}`}>{order.printTimeEstimated || 0}h</p>
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
      } catch (error) {
        console.error("Failed to save queue order");
      } finally {
        setIsSaving(false);
      }
    }
  }

  const totalHours = orders.reduce((acc, order) => acc + (order.printTimeEstimated || 0), 0);
  const daysEstimated = Math.ceil(totalHours / 12);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F1115] p-8 rounded-2xl shadow-2xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Carga Operativa Total</p>
            <div className="flex items-baseline gap-2">
               <p className="text-6xl font-black text-white tracking-tighter">{totalHours.toFixed(1)}</p>
               <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Horas</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Pipeline de Entrega</p>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-slate-300">~</span>
               <p className="text-6xl font-black text-slate-900 tracking-tighter">{daysEstimated}</p>
               <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Días</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl flex flex-col justify-center">
           <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Estado del Servidor</h3>
           <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSaving ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`}></div>
              <p className="text-sm font-bold text-blue-900 uppercase tracking-widest">
                {isSaving ? "Sincronizando..." : "Sincronizado"}
              </p>
           </div>
           <p className="text-[10px] text-blue-400 font-medium mt-4 leading-relaxed uppercase tracking-tighter">
             El orden de manufactura impacta directamente en las fechas tentativas de los clientes.
           </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 border-l-4 border-blue-600">Prioridad de Producción (Drag & Drop)</h2>

        {orders.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-inner">
            <p className="text-slate-300 font-bold uppercase tracking-widest italic">Cola de manufactura despejada</p>
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
