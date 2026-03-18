import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import { FilterHeader } from './ui/headers/FilterHeader';
import { NoteCard } from './note/NoteCard';
import { LoginkeyCard } from './loginkey/LoginkeyCard';
import { Note } from '../types/note';
import { LoginKey } from '../types/loginkey';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface SecondarySidebarProps {
  open: boolean;
  notes: Note[];
  loginKeys: LoginKey[];
  filterType?: 'all' | 'loginKeys' | 'notes';
  onFilterChange?: (filter: 'all' | 'loginKeys' | 'notes') => void;
  onSortClick?: () => void;
  onCreateNote?: () => void;
  onCreateLoginKey?: () => void;
  onEditNote?: (note: Note) => void;
  onEditLoginKey?: (loginkey: LoginKey) => void;
  onReorderNotes?: (notes: Note[]) => void;
  onReorderLoginKeys?: (loginKeys: LoginKey[]) => void;
}

export function SecondarySidebar({
  open,
  notes,
  loginKeys,
  filterType = 'all',
  onFilterChange,
  onSortClick,
  onCreateNote,
  onCreateLoginKey,
  onEditNote,
  onEditLoginKey,
  onReorderNotes,
  onReorderLoginKeys,
}: SecondarySidebarProps) {

  const filteredLoginKeys = filterType === 'notes' ? [] : loginKeys;
  const filteredNotes = filterType === 'loginKeys' ? [] : notes;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndLoginKeys = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderLoginKeys) {
      const oldIndex = loginKeys.findIndex((lk) => lk.id === active.id);
      const newIndex = loginKeys.findIndex((lk) => lk.id === over.id);
      onReorderLoginKeys(arrayMove(loginKeys, oldIndex, newIndex));
    }
  };

  const handleDragEndNotes = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderNotes) {
      const oldIndex = notes.findIndex((n) => n.id === active.id);
      const newIndex = notes.findIndex((n) => n.id === over.id);
      onReorderNotes(arrayMove(notes, oldIndex, newIndex));
    }
  };

  const buttons = [
    { icon: <BadgeIcon />, label: 'ID', onClick: undefined },
    { icon: <CreditCardIcon />, label: 'Credit Card', onClick: undefined },
    { icon: <LoginIcon />, label: 'Login Key', onClick: onCreateLoginKey },
    { icon: <NoteIcon />, label: 'Note', onClick: onCreateNote },
  ];

  function SortableNoteCard({ note, onEdit }: { note: Note; onEdit: (note: Note) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
      useSortable({ id: note.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
      <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <NoteCard note={note} onEdit={onEdit} />
      </Box>
    );
  }

  function SortableLoginkeyCard({ loginkey, onEdit }: { loginkey: LoginKey; onEdit: (loginkey: LoginKey) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
      useSortable({ id: loginkey.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
      <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <LoginkeyCard loginkey={loginkey} onEdit={onEdit} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: open ? 250 : 5,
        flexShrink: 0,
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflowX: 'hidden',
        transition: 'width 250ms ease-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 60,
          p: 2,
          bgcolor: 'action.hover',
          transition: 'opacity 200ms ease-out',
          opacity: open ? 1 : 0,
        }}
      >
        <FilterHeader
          onSortClick={onSortClick}
          filterType={filterType}
          onFilterChange={onFilterChange}
          hasLoginKeys={loginKeys.length > 0}
          hasNotes={notes.length > 0}
        />
      </Box>

      <Divider
        sx={{
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease-out'
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          p: 2.2,
          borderBottom: 1,
          borderColor: 'divider',
          transition: 'opacity 200ms ease-out',
          opacity: open ? 1 : 0,
        }}
      >
        {buttons.map((btn, index) => (
          <Tooltip key={index} title={btn.label} arrow>
            <IconButton
              size="small"
              onClick={btn.onClick}
              disabled={!btn.onClick}
              sx={{
                bgcolor: 'action.selected',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {btn.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredLoginKeys.length > 0 && (
          <>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Login Keys
              </Typography>
            </Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndLoginKeys}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={filteredLoginKeys.map((lk) => lk.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredLoginKeys.map((loginkey) => (
                  <SortableLoginkeyCard
                    key={loginkey.id}
                    loginkey={loginkey}
                    onEdit={onEditLoginKey || (() => {})}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        )}

        {filteredNotes.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, pt: 1, pb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Notas
              </Typography>
            </Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndNotes}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={filteredNotes.map((n) => n.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredNotes.map((note) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote || (() => {})}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        )}
      </Box>
    </Box>
  );
}

export default SecondarySidebar;
