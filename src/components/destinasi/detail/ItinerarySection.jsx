const A = "#F49D1A";

export default function ItinerarySection({ dest, shortLocation }) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900">
        <span className="w-1.5 h-6 sm:w-2 sm:h-8 rounded-full" style={{ backgroundColor: A }}></span>
        Rencana Perjalanan
      </h2>
      <div className="space-y-4 sm:space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {dest.itinerary?.map((item, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-white bg-[#F49D1A] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-[10px] sm:text-xs">
              {item.day}
            </div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] p-3.5 sm:p-5 rounded-2xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-[#F49D1A]/30">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <h4 className="font-bold text-sm sm:text-lg" style={{ color: A }}>Hari {item.day}</h4>
                <span className="text-[10px] sm:text-xs font-semibold text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md" style={{ backgroundColor: A }}>{shortLocation}</span>
              </div>
              <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2">{item.title}</h5>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
