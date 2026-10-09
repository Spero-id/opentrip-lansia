"use client";

import { Trash2 } from "lucide-react";
import type { Participant } from "@/features/checkout";

export default function ParticipantCard({
  participant,
  index,
  onUpdate,
  onRemove,
}: {
  participant: Participant;
  index: number;
  onUpdate: (id: Participant["id"], field: string, value: string) => void;
  onRemove?: (id: Participant["id"]) => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-muted border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">Peserta {index + 1}</span>
        {onRemove && (
          <button onClick={() => onRemove(participant.id)} className="text-destructive-400 hover:text-destructive-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={participant.fullName}
            onChange={(e) => onUpdate(participant.id, "fullName", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          value={participant.birthDate}
          onChange={(e) => {
            const val = e.target.value;
            if (val && val.split("-")[0] && val.split("-")[0].length > 4) return;
            onUpdate(participant.id, "birthDate", val);
          }}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={participant.gender}
          onChange={(e) => onUpdate(participant.id, "gender", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Jenis Kelamin</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
        <input
          type="tel"
          placeholder="No. Telepon"
          value={participant.phone}
          onChange={(e) => onUpdate(participant.id, "phone", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="email"
          placeholder="Email"
          value={participant.email}
          onChange={(e) => onUpdate(participant.id, "email", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Hubungan dengan pemesan (keluarga/teman)"
            value={participant.relationship}
            onChange={(e) => onUpdate(participant.id, "relationship", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}
