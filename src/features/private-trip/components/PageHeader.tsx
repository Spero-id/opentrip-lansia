export default function PageHeader() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <p className="font-semibold text-xs sm:text-sm tracking-[0.14em] mb-2.5" style={{ color: "var(--primary-foreground)" }}>
        SESUAI KEINGINANMU
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-foreground mb-2.5">
        Private <span className="text-primary-foreground">Trip</span>
      </h1>
      <p className="text-sm sm:text-base leading-[1.6] text-muted-foreground max-w-[560px]">
        Rancang perjalananmu sendiri. Isi form di bawah dan tim kami akan segera menghubungi untuk mewujudkan trip impianmu.
      </p>
    </div>
  );
}
