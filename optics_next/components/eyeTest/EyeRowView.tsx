const EyeRowView: React.FC<{ side: "right" | "left"; data: any }> = ({ side, data }) => {
    const prefix = side === "right" ? "R" : "L";
    return (
      <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">{prefix}</h3>
        </div>
        <div>{data[`${side}_sphere`] ?? "-"}</div>
        <div>{data[`${side}_cylinder`] ?? "-"}</div>
        <div>{data[`${side}_axis`] ?? "-"}</div>
        <div>{data[`${side}_reading_add`] ?? "-"}</div>
      </div>
    );
  };

  export default EyeRowView;