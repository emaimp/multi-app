import { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import { FilterHeader } from './FilterHeader';
import { CategoryAccordion } from './CategoryAccordion';
import { IdCard } from '../../../types/id_card';
import { CreditCard } from '../../../types/credit_card';
import { LoginKey } from '../../../types/loginkey';
import { Note } from '../../../types/note';

interface SecondarySidebarProps {
  isLocked?: boolean;
  isLoadingContent?: boolean;
  idCards: IdCard[];
  creditCards: CreditCard[];
  loginKeys: LoginKey[];
  notes: Note[];
  filterType?: 'all' | 'idCards' | 'creditCards' | 'loginKeys' | 'notes';
  selectedItemId?: string | null;
  onFilterChange?: (filter: 'all' | 'idCards' | 'creditCards' | 'loginKeys' | 'notes') => void;
  onSelectItem?: (itemId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSortClick?: () => void;
  onCreateIdCard?: () => void;
  onCreateCreditCard?: () => void;
  onCreateLoginKey?: () => void;
  onCreateNote?: () => void;
  onEditIdCard?: (idCard: IdCard) => void;
  onEditCreditCard?: (creditCard: CreditCard) => void;
  onEditLoginKey?: (loginkey: LoginKey) => void;
  onEditNote?: (note: Note) => void;
  onReorderIdCards?: (idCards: IdCard[]) => void;
  onReorderCreditCards?: (creditCards: CreditCard[]) => void;
  onReorderLoginKeys?: (loginKeys: LoginKey[]) => void;
  onReorderNotes?: (notes: Note[]) => void;
  animationKey?: string;
}

export function SecondarySidebar({
  isLocked = false,
  isLoadingContent = false,
  idCards,
  creditCards,
  loginKeys,
  notes,
  filterType = 'all',
  selectedItemId,
  onFilterChange,
  onSelectItem,
  searchQuery = '',
  onSearchChange,
  onSortClick,
  onCreateIdCard,
  onCreateCreditCard,
  onCreateLoginKey,
  onCreateNote,
  onEditIdCard,
  onEditCreditCard,
  onEditLoginKey,
  onEditNote,
  onReorderIdCards,
  onReorderCreditCards,
  onReorderLoginKeys,
  onReorderNotes,
  animationKey,
}: SecondarySidebarProps) {
  const [idCardsExpanded, setIdCardsExpanded] = useState(false);
  const [creditCardsExpanded, setCreditCardsExpanded] = useState(false);
  const [loginKeysExpanded, setLoginKeysExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  useEffect(() => {
    if (!isLocked && animationKey) {
      setIdCardsExpanded(true);
      const timer = setTimeout(() => {
        setCreditCardsExpanded(true);
        setLoginKeysExpanded(true);
        setNotesExpanded(true);
      }, 150);
      return () => clearTimeout(timer);
    } else if (isLocked) {
      setIdCardsExpanded(false);
      setCreditCardsExpanded(false);
      setLoginKeysExpanded(false);
      setNotesExpanded(false);
    }
  }, [isLocked, animationKey]);

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
    return note.note_name.toLowerCase().includes(searchLower) ||
           note.content.toLowerCase().includes(searchLower);
  };

  const filteredByTypeIdCards = filterType === 'creditCards' || filterType === 'loginKeys' || filterType === 'notes' ? [] : idCards;
  const filteredByTypeCreditCards = filterType === 'idCards' || filterType === 'loginKeys' || filterType === 'notes' ? [] : creditCards;
  const filteredByTypeLoginKeys = filterType === 'idCards' || filterType === 'creditCards' || filterType === 'notes' ? [] : loginKeys;
  const filteredByTypeNotes = filterType === 'idCards' || filterType === 'creditCards' || filterType === 'loginKeys' ? [] : notes;

  const filteredIdCards = filteredByTypeIdCards.filter(matchesIdCardSearch);
  const filteredCreditCards = filteredByTypeCreditCards.filter(matchesCreditCardSearch);
  const filteredLoginKeys = filteredByTypeLoginKeys.filter(matchesLoginKeySearch);
  const filteredNotes = filteredByTypeNotes.filter(matchesNoteSearch);

  const buttons = [
    { icon: <BadgeIcon />, label: 'ID', onClick: onCreateIdCard },
    { icon: <CreditCardIcon />, label: 'Credit Card', onClick: onCreateCreditCard },
    { icon: <LoginIcon />, label: 'Login Key', onClick: onCreateLoginKey },
    { icon: <NoteIcon />, label: 'Note', onClick: onCreateNote },
  ];

  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 60,
          p: 2,
          bgcolor: 'action.hover',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}
      >
        <FilterHeader
          onSortClick={onSortClick}
          filterType={filterType}
          onFilterChange={onFilterChange}
          hasIdCards={idCards.length > 0}
          hasCreditCards={creditCards.length > 0}
          hasLoginKeys={loginKeys.length > 0}
          hasNotes={notes.length > 0}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          p: 2.2,
          borderBottom: 1,
          borderColor: 'divider',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}
      >
        {buttons.map((btn, index) => (
          <Tooltip key={index} title={btn.label} arrow>
            <span>
              <IconButton
                size="small"
                onClick={btn.onClick}
                disabled={!btn.onClick || isLocked}
                sx={{
                  bgcolor: 'action.selected',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {btn.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: isLocked || isLoadingContent ? 'hidden' : 'auto',
          position: 'relative',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLocked) {
            onSelectItem?.(null);
          }
        }}
      >
        {isLoadingContent ? null : isLocked ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '100%',
              pt: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              Select a vault to view its contents.
            </Typography>
          </Box>
        ) : (
          <>
            <CategoryAccordion
              title="ID Cards"
              icon={<BadgeIcon sx={{ fontSize: 20 }} />}
              items={filteredIdCards}
              type="idCards"
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onEditItem={onEditIdCard}
              onReorder={onReorderIdCards}
              defaultExpanded={idCardsExpanded}
              animationKey={animationKey}
            />

            <CategoryAccordion
              title="Credit Cards"
              icon={<CreditCardIcon sx={{ fontSize: 20 }} />}
              items={filteredCreditCards}
              type="creditCards"
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onEditItem={onEditCreditCard}
              onReorder={onReorderCreditCards}
              defaultExpanded={creditCardsExpanded}
              animationKey={animationKey}
            />

            <CategoryAccordion
              title="Login Keys"
              icon={<LoginIcon sx={{ fontSize: 20 }} />}
              items={filteredLoginKeys}
              type="loginKeys"
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onEditItem={onEditLoginKey}
              onReorder={onReorderLoginKeys}
              defaultExpanded={loginKeysExpanded}
              animationKey={animationKey}
            />

            <CategoryAccordion
              title="Notes"
              icon={<NoteIcon sx={{ fontSize: 20 }} />}
              items={filteredNotes}
              type="notes"
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onEditItem={onEditNote}
              onReorder={onReorderNotes}
              defaultExpanded={notesExpanded}
              animationKey={animationKey}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default SecondarySidebar;
