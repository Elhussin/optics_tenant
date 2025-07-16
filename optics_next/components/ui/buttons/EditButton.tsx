import Button from "@/components/ui/buttons/Button";
import { Pencil } from "lucide-react";
import { BaseButtonProps } from "@/types";


export default function EditButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="Edit"
      icon={<Pencil size={16} />}
      onClick={onClick ?? (() => {})}
      variant="primary"
    />
  );
}
