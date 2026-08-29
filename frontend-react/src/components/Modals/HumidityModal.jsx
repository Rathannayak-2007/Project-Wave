import ModalSheet from './ModalSheet';

export default function HumidityModal({ isOpen, onClose, data, dates }) {
  return (
    <ModalSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="HUMIDITY"
      dates={dates}
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      }
    >
      <div className="mb-6">
        <p className="text-[40px] font-light">{data.value}%</p>
        <p className="text-[17px] text-white/80">{data.description}</p>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-sm">{data.dailySummary}</p>
      </div>

      <div className="bg-white/5 rounded-xl p-4 h-[200px] flex items-end gap-1">
        {data.hourlyData.map((val, i) => (
          <div key={i} className="flex-1 bg-accent-blue/30 rounded-t-sm" style={{ height: `${val}%` }} />
        ))}
      </div>
    </ModalSheet>
  );
}
