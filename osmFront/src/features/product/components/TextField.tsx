export const ReturnTextField = ({ data, register, errors }: { data: any[], register: any, errors: any }) => {
    return (
      <>
        {data.map((item, index) => (
          <div className="mb-4" key={index}>
            <label htmlFor={item.name} className="block text-sm font-medium text-gray-700 mb-1">
              {item.label}
            </label>
            <input
              id={item.name}
              type={item.type}
              {...register(item.name)}
              className="input-text"
              placeholder={item.label + "..."}
            />
            {errors[item.name] && <p className="text-red-500 text-sm mt-1">{errors[item.name]?.message}</p>}
          </div>
        ))}
      </>
    );
  }
  