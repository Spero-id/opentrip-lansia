"use client";

import { Trash2 } from "lucide-react";

export default function ParticipantCard({ participant, index, onUpdate, onRemove }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500">Peserta {index + 1}</span>
        {onRemove && (
          <button onClick={() => onRemove(participant.id)} className="text-red-400 hover:text-red-600 transition-colors">
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
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
        <input
          type="date"
          value={participant.birthDate}
          onChange={(e) => onUpdate(participant.id, "birthDate", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
        />
        <select
          value={participant.gender}
          onChange={(e) => onUpdate(participant.id, "gender", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
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
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
        />
        <input
          type="email"
          placeholder="Email"
          value={participant.email}
          onChange={(e) => onUpdate(participant.id, "email", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
        />
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Hubungan dengan pemesan (keluarga/teman)"
            value={participant.relationship}
            onChange={(e) => onUpdate(participant.id, "relationship", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
        </div>
      </div>
    </div>
  );
}
