"use client";

import { useState } from "react";
import { inputCls } from "./helpers/helpers";
import { A } from "./helpers/constants";

const GENDER_OPTIONS = [
  { value: "male",   label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];

const RELATIONSHIP_OPTIONS = [
  "Diri Sendiri", "Pasangan", "Anak", "Orang Tua",
  "Saudara", "Teman", "Kolega", "Lainnya",
];

function isComplete(p) {
  return !!(p.fullName.trim() && p.birthDate && p.gender && p.phone.trim());
}

function ParticipantCard({ participant, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const complete = isComplete(participant);

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={complete
        ? { borderColor: `${A}30`, backgroundColor: `${A}05` }
        : { borderColor: "#e5e7eb", backgroundColor: "#fff" }
      }
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={complete
              ? { backgroundColor: A, color: "#fff" }
              : { backgroundColor: "#f3f4f6", color: "#6b7280" }
            }
          >
            {complete ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {participant.fullName || `Peserta ${index + 1}`}
            </p>
            <p className="text-[10px] text-gray-400">
              {complete
                ? `${participant.gender === "male" ? "Laki-laki" : "Perempuan"} · ${participant.relationship || "—"}`
                : "Lengkapi data peserta"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={complete
              ? { backgroundColor: `${A}15`, color: A, border: `1px solid ${A}30` }
              : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: complete ? A : "#9ca3af" }} />
            {complete ? "Lengkap" : "Belum lengkap"}
          </span>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(participant.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>

          <span className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nama Lengkap <span style={{ color: A }}>*</span>
              </label>
              <input type="text" placeholder="Sesuai KTP / Paspor"
                value={participant.fullName}
                onChange={e => onUpdate(participant.id, "fullName", e.target.value)}
                className={inputCls()} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tanggal Lahir <span style={{ color: A }}>*</span>
              </label>
              <input type="date"
                value={participant.birthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={e => onUpdate(participant.id, "birthDate", e.target.value)}
                className={inputCls()} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Jenis Kelamin <span style={{ color: A }}>*</span>
              </label>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdate(participant.id, "gender", opt.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      participant.gender === opt.value
                        ? "bg-[#F49D1A] text-white border-[#F49D1A]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                No. Ponsel <span style={{ color: A }}>*</span>
              </label>
              <input type="tel" placeholder="Ex. 08123456789"
                value={participant.phone}
                onChange={e => onUpdate(participant.id, "phone", e.target.value)}
                className={inputCls()} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="email" placeholder="Ex. email@example.com"
                value={participant.email}
                onChange={e => onUpdate(participant.id, "email", e.target.value)}
                className={inputCls()} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hubungan</label>
              <select
                value={participant.relationship}
                onChange={e => onUpdate(participant.id, "relationship", e.target.value)}
                className={inputCls(null, "appearance-none")}
              >
                <option value="">Pilih hubungan</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParticipantsSection({
  participants,
  onAdd,
  onUpdate,
  onRemove,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Daftar Peserta <span className="text-red-400">*</span>
          <span className="text-gray-400 font-normal normal-case ml-1">({participants.length})</span>
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F49D1A] text-white text-[11px] font-semibold hover:bg-[#c47d12] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Peserta
        </button>
      </div>

      {participants.length === 0 && (
        <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p className="text-xs text-gray-400 font-medium">Belum ada peserta. Klik &quot;Tambah Peserta&quot; untuk mulai.</p>
        </div>
      )}

      {participants.map((p, i) => (
        <ParticipantCard
          key={p.id}
          participant={p}
          index={i}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
