const A = "#df7224";

export default function PageHeader() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <p className="font-semibold text-sm tracking-wide mb-2" style={{ color: A }}>
        SESUAI KEINGINANMU
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        <span className="text-[#df7224]">Private</span> Trip
      </h1>
      <p className="text-sm text-gray-500 max-w-lg">
        Rancang perjalananmu sendiri. Isi form di bawah dan tim kami akan membantu mewujudkan trip impianmu.
      </p>
    </div>
  );
}
