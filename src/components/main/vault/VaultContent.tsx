import { Box, Typography, Divider } from '@mui/material';
import { NoteList } from './note';
import { LoginkeyList } from './loginkey';
import { IdCardList } from './id_card';
import { Note } from '../../../types/note';
import { LoginKey } from '../../../types/loginkey';
import { IdCard } from '../../../types/id_card';
import { Vault } from '../../../types/vault';
import { useMemo } from 'react';

interface VaultContentProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  vaultLoginKeys: LoginKey[];
  vaultIdCards: IdCard[];
  filterType?: 'all' | 'loginKeys' | 'notes' | 'idCards';
  searchQuery?: string;
  selectedItemId?: string | null;
  isLockedByDefault?: boolean;
  isLoading?: boolean;
  onUpdateNote: (noteId: string, title: string, content: string, color: string) => void;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color: string) => void;
  onUpdateIdCard: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color: string) => void;
}

export function VaultContent({
  selectedVault,
  vaultNotes,
  vaultLoginKeys,
  vaultIdCards,
  filterType = 'all',
  searchQuery = '',
  selectedItemId,
  isLockedByDefault = true,
  isLoading,
  onUpdateNote,
  onUpdateLoginKey,
  onUpdateIdCard,
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

  const matchesIdCardSearch = (idCard: IdCard) => {
    if (!searchQuery) return true;
    return idCard.id_name.toLowerCase().includes(searchLower) ||
           idCard.id_type.toLowerCase().includes(searchLower) ||
           idCard.full_name.toLowerCase().includes(searchLower) ||
           idCard.id_number.toLowerCase().includes(searchLower);
  };

  const filteredByTypeLoginKeys = filterType === 'notes' || filterType === 'idCards' ? [] : vaultLoginKeys;
  const filteredByTypeNotes = filterType === 'loginKeys' || filterType === 'idCards' ? [] : vaultNotes;
  const filteredByTypeIdCards = filterType === 'loginKeys' || filterType === 'notes' ? [] : vaultIdCards;

  const filteredVaultLoginKeys = filteredByTypeLoginKeys.filter(matchesLoginKeySearch);
  const filteredVaultNotes = filteredByTypeNotes.filter(matchesNoteSearch);
  const filteredVaultIdCards = filteredByTypeIdCards.filter(matchesIdCardSearch);

  const animationKey = useMemo(() => 
    `vault-${selectedVault?.id}-${vaultNotes.length}-${vaultLoginKeys.length}-${vaultIdCards.length}-${filterType}`,
    [selectedVault?.id, vaultNotes.length, vaultLoginKeys.length, vaultIdCards.length, filterType]
  );

  const displayedLoginKeys = selectedItemId
    ? filteredVaultLoginKeys.filter((lk) => lk.id === selectedItemId)
    : filteredVaultLoginKeys;

  const displayedNotes = selectedItemId
    ? filteredVaultNotes.filter((n) => n.id === selectedItemId)
    : filteredVaultNotes;

  const displayedIdCards = selectedItemId
    ? filteredVaultIdCards.filter((ic) => ic.id === selectedItemId)
    : filteredVaultIdCards;

  const hasDisplayedLoginKeys = displayedLoginKeys.length > 0;
  const hasDisplayedNotes = displayedNotes.length > 0;
  const hasDisplayedIdCards = displayedIdCards.length > 0;

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

          {(!hasDisplayedLoginKeys && !hasDisplayedNotes && !hasDisplayedIdCards) ? (
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
              {hasDisplayedIdCards && (
                <>
                  <IdCardList
                    idCards={displayedIdCards}
                    isLockedByDefault={isLockedByDefault}
                    animationKey={animationKey}
                    onUpdateIdCard={onUpdateIdCard}
                  />
                  {(hasDisplayedLoginKeys || hasDisplayedNotes) && <Divider sx={{ my: 3 }} />}
                </>
              )}

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
