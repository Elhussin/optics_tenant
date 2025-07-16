import Button from "@/components/ui/buttons/Button";
import { ArrowLeft } from "lucide-react";
import { BaseButtonProps } from "@/types";


export default function RestoreButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="Restore"
      title="This action will restore the item"
      icon={<ArrowLeft size={16} />}
      onClick={onClick ?? (() => {})}
      variant="secondary"
    />
  );
}
