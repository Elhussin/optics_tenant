import Button from "@/components/ui/button/Button";
import { Eye } from "lucide-react";
import { BaseButtonProps } from "@/types";



export default function ViewButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="View"
      icon={<Eye size={16} />}
      onClick={onClick ?? (() => {})}
      variant="info"
    />
  );
}
