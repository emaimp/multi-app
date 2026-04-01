import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemCard } from './ItemCard';

interface SortableItemCardProps<T> {
  item: T;
  title: string;
  color: string;
  colorPalette: Record<string, string>;
  avatarSrc?: string | null;
  avatarFallback: string;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit: (item: T) => void;
}

export function SortableItemCard<T extends { id: string }>({
  item,
  title,
  color,
  colorPalette,
  avatarSrc,
  avatarFallback,
  isSelected,
  onClick,
  onEdit,
}: SortableItemCardProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <ItemCard
        title={title}
        color={color}
        colorPalette={colorPalette}
        avatarSrc={avatarSrc}
        avatarFallback={avatarFallback}
        item={item}
        onEdit={onEdit}
        onClick={onClick}
        isSelected={isSelected}
        isDragging={isDragging}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export default SortableItemCard;
