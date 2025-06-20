import TextInput from "./TextInput";
import MessageAlert from "../MessageAlert";
import { RegisterFormData, MessageType } from "@/types/tenant";

interface Props {
  form: RegisterFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  message: MessageType | null;
  loading: boolean;
}

export default function RegisterForm({ form, onChange, onSubmit, message, loading }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <MessageAlert message={message} />

      <TextInput
        label="Store Name"
        name="name"
        type="text"
        value={form.name}
        onChange={onChange}
        placeholder="e.g. Solo Vision"
        required
      />

      <TextInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="example@store.com"
        required
      />

      <TextInput
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="••••••••"
        required
      />

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
