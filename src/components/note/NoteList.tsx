import { Box } from '@mui/material';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  vault: Vault | undefined;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteList({ notes, vault, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} vault={vault} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
      ))}
    </Box>
  );
}

export default NoteList;
