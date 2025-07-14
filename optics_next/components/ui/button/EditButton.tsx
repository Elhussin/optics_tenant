import Button from "@/components/ui/Button";
import { Pencil } from "lucide-react";

interface EditButtonProps {
  onClick?: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
  return (
    <Button
      label="Edit"
      icon={<Pencil size={16} />}
      onClick={onClick ?? (() => {})}
      variant="primary"
    />
  );
}
