import { Box } from '@mui/material';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  vault: Vault | undefined;
  lockedNoteIds?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteList({ notes, vault, lockedNoteIds, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          vault={vault} 
          isLockedByDefault={lockedNoteIds?.has(note.id) ?? false} 
          onUpdate={onUpdateNote} 
          onDelete={onDeleteNote} 
        />
      ))}
    </Box>
  );
}

export default NoteList;
