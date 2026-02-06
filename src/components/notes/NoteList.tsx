import { Box, List, Typography } from '@mui/material';
import { Note } from '../../types/note';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
}

export function NoteList({ notes, onEditNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <List>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEditNote}
          />
        ))}
      </List>
      {notes.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No notes yet. Click "New Note" to create one.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default NoteList;
