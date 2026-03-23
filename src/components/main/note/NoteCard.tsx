import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Note, NOTE_COLORS_HEX } from '../../../types/note';
import { AvatarDisplay } from '../../ui/avatar';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}

export function NoteCard({ note, onEdit, onClick, isSelected, isDragging, dragAttributes, dragListeners }: NoteCardProps) {
  const colorHex = NOTE_COLORS_HEX[note.color] || NOTE_COLORS_HEX.blue;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1,
        borderLeft: '4px solid',
        borderLeftColor: colorHex,
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        cursor: isDragging ? 'grabbing' : 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      {...dragAttributes}
      {...dragListeners}
    >
      <AvatarDisplay
        src={note.image}
        fallback={note.title.charAt(0).toUpperCase()}
      />

      <Box sx={{ flexGrow: 1, ml: 2, overflow: 'hidden' }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {note.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {note.content}
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(note);
        }}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default NoteCard;
