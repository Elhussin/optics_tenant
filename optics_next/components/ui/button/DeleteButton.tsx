import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick?: () => void;
}

export default function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <Button
      label="Delete"
      icon={<Trash2 size={16} />}
      onClick={onClick ?? (() => {})}
      variant="danger"
    />
  );
}
