import { Box, Typography, Divider } from '@mui/material';
import { NoteList } from './note';
import { LoginkeyList } from './loginkey';
import { Note } from '../../../types/note';
import { LoginKey } from '../../../types/loginkey';
import { Vault } from '../../../types/vault';
import { useMemo } from 'react';

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
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details?: string | null) => void;
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
  onUpdateLoginKey,
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

  const animationKey = useMemo(() => 
    `vault-${selectedVault?.id}-${vaultNotes.length}-${vaultLoginKeys.length}-${filterType}`,
    [selectedVault?.id, vaultNotes.length, vaultLoginKeys.length, filterType]
  );

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
        overflow: 'auto',
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
                  <LoginkeyList
                    loginKeys={displayedLoginKeys}
                    isLockedByDefault={isLockedByDefault}
                    animationKey={animationKey}
                    onUpdateLoginKey={onUpdateLoginKey}
                  />
                  {hasDisplayedNotes && <Divider sx={{ my: 3 }} />}
                </>
              )}

              {hasDisplayedNotes && (
                <NoteList
                  notes={displayedNotes}
                  isLockedByDefault={isLockedByDefault}
                  animationKey={animationKey}
                  onUpdateNote={onUpdateNote}
                />
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
