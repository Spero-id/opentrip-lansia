const TABS = [
  { id: "tentang", label: "Deskripsi" },
  { id: "itinerary", label: "Itinerary" },
  { id: "meeting", label: "Titik Kumpul" },
  { id: "ulasan", label: "Ulasan" },
];

export default function DestinationTabs({ activeTab, onChange }) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-100 bg-white mb-8 sticky top-[72px] z-40 pt-4">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base whitespace-nowrap border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'text-[#df7224] border-[#df7224]'
              : 'border-transparent text-gray-500 hover:text-[#df7224]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { TABS };
