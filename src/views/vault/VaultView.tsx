import { useState, useEffect } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NoteTypeSelector, NoteList } from '../../components/note';
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
  lockedNotes?: Set<string>;
  isLoading?: boolean;
  onAddSimpleNote: () => void;
  onAddAccessNote: () => void;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onReorderNotes: (notes: Note[]) => void;
}

export function VaultView({
  selectedVault,
  vaultNotes,
  lockedNotes,
  isLoading,
  onAddSimpleNote,
  onAddAccessNote,
  onUpdateNote,
  onDeleteNote,
  onReorderNotes,
}: VaultViewProps) {
  const [createType, setCreateType] = useState<string | null>(null);
  const [noteTypeSelectorOpen, setNoteTypeSelectorOpen] = useState(false);

  useEffect(() => {
    if (createType) {
      const timer = setTimeout(() => {
        setCreateType(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [createType]);

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

  const handleNewNoteClick = () => {
    setNoteTypeSelectorOpen(true);
  };

  const handleSelectSimpleNote = () => {
    setCreateType('simpleNote');
    onAddSimpleNote();
  };

  const handleSelectAccessNote = () => {
    setCreateType('accessNote');
    onAddAccessNote();
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">{selectedVault.name}</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewNoteClick}
            >
              New Note
            </Button>
          </Box>

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
              <Typography variant="body2" color="text.secondary">
                Click "New Note" to create your first note
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
                  lockedNotes={lockedNotes}
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

      <NoteTypeSelector
        open={noteTypeSelectorOpen}
        onClose={() => setNoteTypeSelectorOpen(false)}
        onSelectSimpleNote={handleSelectSimpleNote}
        onSelectAccessNote={handleSelectAccessNote}
      />
    </Box>
  );
}

export default VaultView;
