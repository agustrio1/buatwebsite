import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

type Item = { id: string; value: string };

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function SortableRow({
  item,
  onChange,
  onRemove,
  placeholder,
}: {
  item: Item;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Urutkan"
      >
        <GripVertical size={16} />
      </button>
      <input
        type="text"
        value={item.value}
        onChange={(e) => onChange(item.id, e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-0 focus:ring-0 text-sm px-1 py-1 outline-none"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-slate-300 hover:text-red-500 shrink-0"
        aria-label="Hapus"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function SortableTextList({
  name,
  label,
  placeholder,
  defaultValue = [],
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string[];
}) {
  const [items, setItems] = useState<Item[]>(
    defaultValue.map((v) => ({ id: makeId(), value: v }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function updateValue(id: string, value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, value } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: makeId(), value: "" }]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                onChange={updateValue}
                onRemove={removeItem}
                placeholder={placeholder}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada item.</p>}

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.map((i) => i.value).filter((v) => v.trim() !== ""))}
      />
    </div>
  );
}