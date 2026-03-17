import { Box, Typography, Divider } from '@mui/material';
import { NoteList } from '../../components/note';
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
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';

interface VaultViewProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  isLoading?: boolean;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onReorderNotes: (notes: Note[]) => void;
}

export function VaultView({
  selectedVault,
  vaultNotes,
  isLoading,
  onUpdateNote,
  onDeleteNote,
  onReorderNotes,
}: VaultViewProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = vaultNotes.findIndex((n) => n.id === active.id);
      const newIndex = vaultNotes.findIndex((n) => n.id === over.id);
      const newNotes = arrayMove(vaultNotes, oldIndex, newIndex);
      onReorderNotes(newNotes);
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Typography variant="h4">{selectedVault.name}</Typography>

          <Divider sx={{ my: 3 }} />

          {vaultNotes.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '70vh',
            }}>
              <Typography color="text.secondary" gutterBottom>
                No notes yet in this vault
              </Typography>
            </Box>
          ) : (
            <Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={vaultNotes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
                <NoteList
                  notes={vaultNotes}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                />
              </SortableContext>
              </DndContext>
            </Box>
          )}
        </>
      ) : isLoading ? (
        null
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '90vh',
        }}>
          <Typography variant="h4" gutterBottom>
            Welcome! 🙂
          </Typography>
          <Typography color="text.secondary">
            Select a vault to view its details or create one using the "New" button
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default VaultView;
