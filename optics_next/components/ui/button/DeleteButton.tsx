import Button from "@/components/ui/button/Button";
import { Trash2 } from "lucide-react";
import { BaseButtonProps } from "@/types";

export default function DeleteButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="Delete"
      icon={<Trash2 size={16} />}
      onClick={onClick ?? (() => {})}
      variant="danger"
    />
  );
}
