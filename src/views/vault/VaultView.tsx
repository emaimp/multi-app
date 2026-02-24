import { useState } from 'react';
import { Box, Typography, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyIcon from '@mui/icons-material/Key';
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
import { NoteList } from '../../components/note/NoteList';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';

interface VaultViewProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  lockedNoteIds?: Set<string>;
  username?: string;
  onAddSimpleNote: () => void;
  onAddAccessNote: () => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onReorderNotes: (notes: Note[]) => void;
}

export function VaultView({
  selectedVault,
  vaultNotes,
  lockedNoteIds,
  username,
  onAddSimpleNote,
  onAddAccessNote,
  onUpdateNote,
  onDeleteNote,
  onReorderNotes,
}: VaultViewProps) {
  const [createType, setCreateType] = useState<string | null>('simpleNote');

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

  const handleCreateType = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType === 'simpleNote') {
      onAddSimpleNote();
    } else if (newType === 'accessNote') {
      onAddAccessNote();
    }
    setCreateType(newType);
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">{selectedVault.name}</Typography>
            <ToggleButtonGroup
              value={createType}
              exclusive
              onChange={handleCreateType}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  minWidth: 150,
                },
              }}
            >
              <ToggleButton value="simpleNote">
                <DescriptionIcon sx={{ mr: 1 }} /> Simple Note
              </ToggleButton>
              <ToggleButton value="accessNote">
                <KeyIcon sx={{ mr: 1 }} /> Access Note
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 3 }} />

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
                  vault={selectedVault}
                  lockedNoteIds={lockedNoteIds}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                />
              </SortableContext>
            </DndContext>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Welcome, {username}
          </Typography>
          <Typography color="text.secondary">
            Select a vault from the list to view details.
          </Typography>
        </>
      )}
    </Box>
  );
}

export default VaultView;
