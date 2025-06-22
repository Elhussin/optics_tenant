interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
  }
  
  export default function TextInput({ label, ...props }: Props) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="input-base" />
      </div>
    );
  }
  