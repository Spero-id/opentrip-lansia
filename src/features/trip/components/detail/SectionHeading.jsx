export default function SectionHeading({ icon: Icon, children, className = "" }) {
  return (
    <div className={`mb-6 flex items-center gap-3 ${className}`}>
      
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {children}
      </h2>
    </div>
  );
}