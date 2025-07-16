import Button from "@/components/ui/buttons/Button";
import { X } from "lucide-react";
import { BaseButtonProps } from "@/types";

export default function CloseButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label=""
      icon={<X size={20} />}
      onClick={onClick ?? (() => {})}
      variant="close"
    />
  );
}
