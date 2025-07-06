import Button from "@/components/ui/Button";
import { Eye, Pencil, Trash2 } from "lucide-react"; // أيقونات جميلة

export default function ActionButtons({ onView, onEdit, onDelete }: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        label="View"
        onClick={onView || (() => {})}
        icon={<Eye size={16} />}
        variant="secondary"
      />
      <Button
        label="Edit"
        onClick={onEdit || (() => {})}
        icon={<Pencil size={16} />}
        variant="primary"
      />
      <Button
        label="Delete"
        onClick={onDelete || (() => {})}
        icon={<Trash2 size={16} />}
        variant="danger"
      />
    </div>
  );
}
