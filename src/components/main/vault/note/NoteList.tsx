import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Note } from '../../../../types/note';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

function NoteItemComponent({ note, isLockedByDefault, onUpdateNote, animationKey }: { note: Note; isLockedByDefault?: boolean; animationKey?: string; onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void }) {
  return (
    <motion.div
      key={`${animationKey}-${note.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <NoteItem
        note={note}
        isLockedByDefault={isLockedByDefault}
        onUpdate={(noteId, title, content) => onUpdateNote(noteId, title, content)}
      />
    </motion.div>
  );
}

export function NoteList({ notes, isLockedByDefault, animationKey, onUpdateNote }: NoteListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {notes.map((note) => (
        <NoteItemComponent
          key={note.id}
          note={note}
          isLockedByDefault={isLockedByDefault}
          animationKey={animationKey}
          onUpdateNote={onUpdateNote}
        />
      ))}
    </Box>
  );
}

export default NoteList;
