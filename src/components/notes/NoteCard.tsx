import { Box, Avatar, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Note } from '../../types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

const NOTE_COLORS_HEX: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0891b2',
};

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const colorHex = NOTE_COLORS_HEX[note.color] || NOTE_COLORS_HEX.primary;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          border: '3px solid',
          borderColor: colorHex,
          bgcolor: 'transparent',
        }}
        src={note.image}
      >
        {note.name.charAt(0).toUpperCase()}
      </Avatar>

      <Typography
        variant="body1"
        sx={{
          flexGrow: 1,
          ml: 2,
          fontWeight: 500,
        }}
      >
        {note.name}
      </Typography>

      <IconButton
        size="small"
        onClick={() => onEdit(note)}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default NoteCard;
