import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../types/note';
import { SimpleNoteCard } from './SimpleNoteCard';
import { AccessNoteCard } from './AccessNoteCard';

const ACCESS_NOTE_DELIMITER = '::';

interface NoteListProps {
  notes: Note[];
  lockedNotes?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface SortableNoteItemProps {
  note: Note;
  lockedNotes?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function SortableNoteItem({ note, lockedNotes, onUpdateNote, onDeleteNote }: SortableNoteItemProps) {
  const isAccessNote = note.content.includes(ACCESS_NOTE_DELIMITER);

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

  const CardComponent = isAccessNote ? AccessNoteCard : SimpleNoteCard;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <CardComponent
        note={note}
        isLockedByDefault={lockedNotes?.has(note.id) ?? false}
        onUpdate={onUpdateNote}
        onDelete={onDeleteNote}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function NoteList({ notes, lockedNotes, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <SortableNoteItem
          key={note.id}
          note={note}
          lockedNotes={lockedNotes}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
