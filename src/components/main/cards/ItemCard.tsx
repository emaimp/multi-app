import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AvatarDisplay } from '../../ui/avatar';

interface ItemCardProps<T> {
  title: string;
  color: string;
  colorPalette: Record<string, string>;
  avatarSrc?: string | null;
  avatarFallback: string;
  isSelected?: boolean;
  isDragging?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  onClick?: () => void;
  onEdit: (item: T) => void;
  item: T;
}

export function ItemCard<T>({ 
  title, 
  color, 
  colorPalette, 
  avatarSrc, 
  avatarFallback, 
  isSelected, 
  isDragging, 
  dragAttributes, 
  dragListeners, 
  onClick, 
  onEdit, 
  item 
}: ItemCardProps<T>) {
  const colorHex = colorPalette[color] || Object.values(colorPalette)[0];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        borderLeft: '4px solid',
        borderLeftColor: colorHex,
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        cursor: isDragging ? 'grabbing' : 'pointer',
        boxSizing: 'border-box',
        overflow: 'hidden',
        width: '100%',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      {...dragAttributes}
      {...dragListeners}
    >
      <AvatarDisplay
        src={avatarSrc}
        fallback={avatarFallback}
      />

      <Typography
        variant="body1"
        sx={{
          flexGrow: 1,
          ml: 2,
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default ItemCard;
