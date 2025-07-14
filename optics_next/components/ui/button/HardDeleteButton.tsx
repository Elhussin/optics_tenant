import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface HardDeleteButtonProps {
  onClick?: () => void;
}

export default function HardDeleteButton({ onClick }: HardDeleteButtonProps) {
  return (
    <Button
      label="Remove"
      icon={<Trash2 size={16} />}
      onClick={onClick}
      variant="danger"
    />
  );
}
