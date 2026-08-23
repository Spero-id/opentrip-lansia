const A = "#F49D1A";

export default function PageHeader() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <p className="font-semibold text-[11px] sm:text-xs tracking-[0.14em] mb-2.5" style={{ color: A }}>
        SESUAI KEINGINANMU
      </p>
      <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight text-[#111827] mb-2.5">
        Private <span className="text-[#F49D1A]">Trip</span>
      </h1>
      <p className="text-[13px] leading-[1.6] text-[#6B7280] max-w-[560px]">
        Rancang perjalananmu sendiri. Isi form di bawah dan tim kami akan segera menghubungi untuk mewujudkan trip impianmu.
      </p>
    </div>
  );
}
