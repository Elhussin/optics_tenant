import { MessageType } from "@/src/types/tenant";

export default function MessageAlert({ message }: { message:   | null }) {
  if (!message) return null;

  return (
    <div className={message.type === "success" ? "alert-success" : "alert-error"}>
      {message.text}
    </div>
  );
}
