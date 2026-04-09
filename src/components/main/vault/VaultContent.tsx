import { Box, Typography, Divider } from '@mui/material';
import { IdCardList } from './id_card';
import { CreditCardList } from './credit_card';
import { LoginkeyList } from './loginkey';
import { NoteList } from './note';
import { IdCard } from '../../../types/id_card';
import { CreditCard } from '../../../types/credit_card';
import { LoginKey } from '../../../types/loginkey';
import { Note } from '../../../types/note';
import { Vault } from '../../../types/vault';
import { useMemo } from 'react';

interface VaultContentProps {
  selectedVault: Vault | undefined;
  vaultIdCards: IdCard[];
  vaultCreditCards: CreditCard[];
  vaultLoginKeys: LoginKey[];
  vaultNotes: Note[];
  filterType?: 'all' | 'idCards' | 'creditCards' | 'loginKeys' | 'notes';
  searchQuery?: string;
  selectedItemId?: string | null;
  isLockedByDefault?: boolean;
  isLoading?: boolean;
  onUpdateIdCard: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color: string) => void;
  onUpdateCreditCard: (creditCardId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color: string) => void;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color: string) => void;
  onUpdateNote: (noteId: string, title: string, content: string, color: string) => void;
}

export function VaultContent({
  selectedVault,
  vaultIdCards,
  vaultCreditCards,
  vaultLoginKeys,
  vaultNotes,
  filterType = 'all',
  searchQuery = '',
  selectedItemId,
  isLockedByDefault = true,
  isLoading,
  onUpdateIdCard,
  onUpdateCreditCard,
  onUpdateLoginKey,
  onUpdateNote,
}: VaultContentProps) {
  const searchLower = searchQuery.toLowerCase();

  const matchesIdCardSearch = (idCard: IdCard) => {
    if (!searchQuery) return true;
    return idCard.id_name.toLowerCase().includes(searchLower) ||
           idCard.id_type.toLowerCase().includes(searchLower) ||
           idCard.full_name.toLowerCase().includes(searchLower) ||
           idCard.id_number.toLowerCase().includes(searchLower);
  };

  const matchesCreditCardSearch = (creditCard: CreditCard) => {
    if (!searchQuery) return true;
    return creditCard.card_name.toLowerCase().includes(searchLower) ||
           creditCard.holder_name.toLowerCase().includes(searchLower) ||
           creditCard.card_number.toLowerCase().includes(searchLower);
  };

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

  const filteredByTypeIdCards = filterType === 'creditCards' || filterType === 'loginKeys' || filterType === 'notes' ? [] : vaultIdCards;
  const filteredByTypeCreditCards = filterType === 'idCards' || filterType === 'loginKeys' || filterType === 'notes' ? [] : vaultCreditCards;
  const filteredByTypeLoginKeys = filterType === 'idCards' || filterType === 'creditCards' || filterType === 'notes' ? [] : vaultLoginKeys;
  const filteredByTypeNotes = filterType === 'idCards' || filterType === 'creditCards' || filterType === 'loginKeys' ? [] : vaultNotes;

  const filteredVaultIdCards = filteredByTypeIdCards.filter(matchesIdCardSearch);
  const filteredVaultCreditCards = filteredByTypeCreditCards.filter(matchesCreditCardSearch);
  const filteredVaultLoginKeys = filteredByTypeLoginKeys.filter(matchesLoginKeySearch);
  const filteredVaultNotes = filteredByTypeNotes.filter(matchesNoteSearch);

  const animationKey = useMemo(() => 
    `vault-${selectedVault?.id}-${vaultIdCards.length}-${vaultCreditCards.length}-${vaultLoginKeys.length}-${vaultNotes.length}-${filterType}`,
    [selectedVault?.id, vaultIdCards.length, vaultCreditCards.length, vaultLoginKeys.length, vaultNotes.length, filterType]
  );

  const displayedIdCards = selectedItemId
    ? filteredVaultIdCards.filter((ic) => ic.id === selectedItemId)
    : filteredVaultIdCards;

  const displayedCreditCards = selectedItemId
    ? filteredVaultCreditCards.filter((cc) => cc.id === selectedItemId)
    : filteredVaultCreditCards;

  const displayedLoginKeys = selectedItemId
    ? filteredVaultLoginKeys.filter((lk) => lk.id === selectedItemId)
    : filteredVaultLoginKeys;

  const displayedNotes = selectedItemId
    ? filteredVaultNotes.filter((n) => n.id === selectedItemId)
    : filteredVaultNotes;

  const hasDisplayedIdCards = displayedIdCards.length > 0;
  const hasDisplayedCreditCards = displayedCreditCards.length > 0;
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

          {(!hasDisplayedLoginKeys && !hasDisplayedNotes && !hasDisplayedIdCards && !hasDisplayedCreditCards) ? (
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
                  {(hasDisplayedCreditCards || hasDisplayedLoginKeys || hasDisplayedNotes) && <Divider sx={{ my: 3 }} />}
                </>
              )}

              {hasDisplayedCreditCards && (
                <>
                  <CreditCardList
                    creditCards={displayedCreditCards}
                    isLockedByDefault={isLockedByDefault}
                    animationKey={animationKey}
                    onUpdateCreditCard={onUpdateCreditCard}
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
