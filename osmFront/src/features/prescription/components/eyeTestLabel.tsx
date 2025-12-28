
const EyeTestLabel = () => {
  return (
    <div className="grid grid-cols-[60px_repeat(4,1fr)] gap-3 mb-2 px-0">
      <div className="w-10"></div> {/* Spacer for Eye Badge */}
      <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">SPH</label>
      <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">CYL</label>
      <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">AXIS</label>
      <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">ADD</label>
    </div>
  );
};

const EyeTestLabelProps = () => {
  return (
    <div className="grid grid-cols-[60px_repeat(4,1fr)] md:grid-cols-5 gap-3 mb-2 px-0">
       <div className="w-10 md:hidden"></div> {/* Spacer for Eye Badge on Mobile */}
       <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">PD</label>
       <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">SG</label>
       <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">VD</label>
       <label className="text-center text-xs font-semibold uppercase text-gray-400 tracking-wider">VA</label>
       <div className="hidden md:block"></div> {/* Spacer for grid specific to desktop */}
    </div>
  );
};

export { EyeTestLabel, EyeTestLabelProps };


