import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../../../types/note';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface SortableNoteItemCallbacks {
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

function SortableNoteItem({ note, isLockedByDefault, onUpdateNote, onDeleteNote, animationKey }: SortableNoteItemCallbacks & { note: Note; isLockedByDefault?: boolean; animationKey?: string }) {
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
    <motion.div
      key={`${animationKey}-${note.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
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
    </motion.div>
  );
}

export function NoteList({ notes, isLockedByDefault, animationKey, onUpdateNote, onDeleteNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <SortableNoteItem
          key={note.id}
          note={note}
          isLockedByDefault={isLockedByDefault}
          animationKey={animationKey}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
