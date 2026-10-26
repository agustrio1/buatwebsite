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

type Faq = { id: string; question: string; answer: string };

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function SortableFaqRow({
  item,
  onChange,
  onRemove,
}: {
  item: Faq;
  onChange: (id: string, key: "question" | "answer", value: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none inline-flex items-center gap-1.5 text-xs"
          aria-label="Urutkan"
        >
          <GripVertical size={16} /> Geser untuk urutkan
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:underline text-xs inline-flex items-center gap-1"
        >
          <Trash2 size={12} /> Hapus
        </button>
      </div>
      <input
        type="text"
        value={item.question}
        onChange={(e) => onChange(item.id, "question", e.target.value)}
        placeholder="Pertanyaan"
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2"
      />
      <textarea
        value={item.answer}
        onChange={(e) => onChange(item.id, "answer", e.target.value)}
        placeholder="Jawaban"
        rows={2}
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

export function SortableFaqList({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: { question: string; answer: string }[];
}) {
  const [items, setItems] = useState<Faq[]>(defaultValue.map((f) => ({ id: makeId(), ...f })));

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

  function updateField(id: string, key: "question" | "answer", value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: makeId(), question: "", answer: "" }]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-600">FAQ Khusus Kota Ini</label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          <Plus size={14} /> Tambah FAQ
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <SortableFaqRow key={item.id} item={item} onChange={updateField} onRemove={removeItem} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada FAQ.</p>}

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          items
            .filter((i) => i.question.trim() !== "" || i.answer.trim() !== "")
            .map(({ question, answer }) => ({ question, answer }))
        )}
      />
    </div>
  );
}