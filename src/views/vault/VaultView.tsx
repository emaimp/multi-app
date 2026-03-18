import { Box, Typography, Divider } from '@mui/material';
import { NoteList } from '../../components/note';
import { LoginkeyList } from '../../components/loginkey';
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
import { LoginKey } from '../../types/loginkey';
import { Vault } from '../../types/vault';

interface VaultViewProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  vaultLoginKeys: LoginKey[];
  isLoading?: boolean;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onReorderNotes: (notes: Note[]) => void;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details?: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
  onReorderLoginKeys: (loginKeys: LoginKey[]) => void;
}

export function VaultView({
  selectedVault,
  vaultNotes,
  vaultLoginKeys,
  isLoading,
  onUpdateNote,
  onDeleteNote,
  onReorderNotes,
  onUpdateLoginKey,
  onDeleteLoginKey,
  onReorderLoginKeys,
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

  const handleDragEndNotes = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = vaultNotes.findIndex((n) => n.id === active.id);
      const newIndex = vaultNotes.findIndex((n) => n.id === over.id);
      const newNotes = arrayMove(vaultNotes, oldIndex, newIndex);
      onReorderNotes(newNotes);
    }
  };

  const handleDragEndLoginKeys = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = vaultLoginKeys.findIndex((lk) => lk.id === active.id);
      const newIndex = vaultLoginKeys.findIndex((lk) => lk.id === over.id);
      const newLoginKeys = arrayMove(vaultLoginKeys, oldIndex, newIndex);
      onReorderLoginKeys(newLoginKeys);
    }
  };

  const hasLoginKeys = vaultLoginKeys.length > 0;
  const hasNotes = vaultNotes.length > 0;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Typography variant="h4">{selectedVault.name}</Typography>

          <Divider sx={{ my: 3 }} />

          {(!hasLoginKeys && !hasNotes) ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '70vh',
            }}>
              <Typography color="text.secondary" gutterBottom>
                No items yet in this vault
              </Typography>
            </Box>
          ) : (
            <Box>
              {hasLoginKeys && (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndLoginKeys}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext 
                      items={vaultLoginKeys.map((lk) => lk.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <LoginkeyList
                        loginKeys={vaultLoginKeys}
                        onUpdateLoginKey={onUpdateLoginKey}
                        onDeleteLoginKey={onDeleteLoginKey}
                      />
                    </SortableContext>
                  </DndContext>
                  {hasNotes && <Divider sx={{ my: 3 }} />}
                </>
              )}

              {hasNotes && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndNotes}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={vaultNotes.map((n) => n.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <NoteList
                      notes={vaultNotes}
                      onUpdateNote={onUpdateNote}
                      onDeleteNote={onDeleteNote}
                    />
                  </SortableContext>
                </DndContext>
              )}
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
