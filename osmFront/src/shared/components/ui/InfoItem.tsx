// ✨ Info Item Component - Premium Design
// this component is used in the product view details page and variant view details page
//  it give a hint to the user about thie field 
export function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated/50 hover:bg-elevated transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 group">
      <div className="text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-secondary mb-0.5">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}