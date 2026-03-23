import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../../types/note';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  isLockedByDefault?: boolean;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface SortableNoteItemCallbacks {
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function SortableNoteItem({ note, isLockedByDefault, onUpdateNote, onDeleteNote }: SortableNoteItemCallbacks & { note: Note; isLockedByDefault?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <NoteItem
        note={note}
        isLockedByDefault={isLockedByDefault}
        onUpdate={onUpdateNote}
        onDelete={onDeleteNote}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function NoteList({ notes, isLockedByDefault, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <SortableNoteItem
          key={note.id}
          note={note}
          isLockedByDefault={isLockedByDefault}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
