import { Box, Typography, Divider } from '@mui/material';
import { NoteList } from '../note';
import { LoginkeyList } from '../loginkey';
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
import { Note } from '../../../types/note';
import { LoginKey } from '../../../types/loginkey';
import { Vault } from '../../../types/vault';

interface VaultContentProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  vaultLoginKeys: LoginKey[];
  filterType?: 'all' | 'loginKeys' | 'notes';
  searchQuery?: string;
  selectedItemId?: string | null;
  isLockedByDefault?: boolean;
  isLoading?: boolean;
  onUpdateNote: (noteId: string, title: string, content: string, color?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onReorderNotes: (notes: Note[]) => void;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details?: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
  onReorderLoginKeys: (loginKeys: LoginKey[]) => void;
}

export function VaultContent({
  selectedVault,
  vaultNotes,
  vaultLoginKeys,
  filterType = 'all',
  searchQuery = '',
  selectedItemId,
  isLockedByDefault = true,
  isLoading,
  onUpdateNote,
  onDeleteNote,
  onReorderNotes,
  onUpdateLoginKey,
  onDeleteLoginKey,
  onReorderLoginKeys,
}: VaultContentProps) {
  const searchLower = searchQuery.toLowerCase();

  const matchesLoginKeySearch = (lk: LoginKey) => {
    if (!searchQuery) return true;
    return lk.site_name.toLowerCase().includes(searchLower) ||
           lk.username.toLowerCase().includes(searchLower) ||
           (lk.url?.toLowerCase().includes(searchLower) ?? false);
  };

  const matchesNoteSearch = (note: Note) => {
    if (!searchQuery) return true;
    return note.title.toLowerCase().includes(searchLower) ||
           note.content.toLowerCase().includes(searchLower);
  };

  const filteredByTypeLoginKeys = filterType === 'notes' ? [] : vaultLoginKeys;
  const filteredByTypeNotes = filterType === 'loginKeys' ? [] : vaultNotes;

  const filteredVaultLoginKeys = filteredByTypeLoginKeys.filter(matchesLoginKeySearch);
  const filteredVaultNotes = filteredByTypeNotes.filter(matchesNoteSearch);
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

  const displayedLoginKeys = selectedItemId
    ? filteredVaultLoginKeys.filter((lk) => lk.id === selectedItemId)
    : filteredVaultLoginKeys;

  const displayedNotes = selectedItemId
    ? filteredVaultNotes.filter((n) => n.id === selectedItemId)
    : filteredVaultNotes;

  const hasDisplayedLoginKeys = displayedLoginKeys.length > 0;
  const hasDisplayedNotes = displayedNotes.length > 0;

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'hidden',
        height: '100vh',
        boxSizing: 'border-box',
        p: 3
      }}
    >
      {selectedVault ? (
        <>
          <Typography variant="h4">{selectedVault.name}</Typography>

          <Divider sx={{ my: 3 }} />

          {(!hasDisplayedLoginKeys && !hasDisplayedNotes) ? (
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
              {hasDisplayedLoginKeys && (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndLoginKeys}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext 
                      items={displayedLoginKeys.map((lk) => lk.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <LoginkeyList
                        loginKeys={displayedLoginKeys}
                        isLockedByDefault={isLockedByDefault}
                        onUpdateLoginKey={onUpdateLoginKey}
                        onDeleteLoginKey={onDeleteLoginKey}
                      />
                    </SortableContext>
                  </DndContext>
                  {hasDisplayedNotes && <Divider sx={{ my: 3 }} />}
                </>
              )}

              {hasDisplayedNotes && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndNotes}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={displayedNotes.map((n) => n.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <NoteList
                      notes={displayedNotes}
                      isLockedByDefault={isLockedByDefault}
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

export default VaultContent;
