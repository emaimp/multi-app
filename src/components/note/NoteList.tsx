import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../types/note';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  isLockedByDefault?: boolean;
  newlyCreatedIds?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface SortableNoteItemProps {
  note: Note;
  isLockedByDefault?: boolean;
  newlyCreatedIds?: Set<string>;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function SortableNoteItem({ note, isLockedByDefault, newlyCreatedIds, onUpdateNote, onDeleteNote }: SortableNoteItemProps) {
  const isNewlyCreated = newlyCreatedIds?.has(note.id) ?? false;
  const itemIsLockedByDefault = isNewlyCreated ? false : (isLockedByDefault ?? true);
  
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
        isLockedByDefault={itemIsLockedByDefault}
        onUpdate={onUpdateNote}
        onDelete={onDeleteNote}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function NoteList({ notes, isLockedByDefault, newlyCreatedIds, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <SortableNoteItem
          key={note.id}
          note={note}
          isLockedByDefault={isLockedByDefault}
          newlyCreatedIds={newlyCreatedIds}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
