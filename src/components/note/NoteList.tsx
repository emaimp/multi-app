import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';
import { SimpleNoteCard } from './SimpleNoteCard';
import { AccessNoteCard } from './AccessNoteCard';

const ACCESS_NOTE_DELIMITER = '::';

interface NoteListProps {
  notes: Note[];
  vault: Vault | undefined;
  lockedNoteIds?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface SortableNoteItemProps {
  note: Note;
  vault: Vault | undefined;
  lockedNoteIds?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function SortableNoteItem({ note, vault, lockedNoteIds, onUpdateNote, onDeleteNote }: SortableNoteItemProps) {
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
        vault={vault}
        isLockedByDefault={lockedNoteIds?.has(note.id) ?? false}
        onUpdate={onUpdateNote}
        onDelete={onDeleteNote}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function NoteList({ notes, vault, lockedNoteIds, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <SortableNoteItem
          key={note.id}
          note={note}
          vault={vault}
          lockedNoteIds={lockedNoteIds}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
