import { useEffect, useState } from 'react';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import { FilterHeader } from './FilterHeader';
import { CategoryAccordion } from './CategoryAccordion';
import { Note } from '../../../types/note';
import { LoginKey } from '../../../types/loginkey';
import { IdCard } from '../../../types/id_card';

interface SecondarySidebarProps {
  isLocked?: boolean;
  isLoadingContent?: boolean;
  notes: Note[];
  loginKeys: LoginKey[];
  idCards: IdCard[];
  filterType?: 'all' | 'loginKeys' | 'notes' | 'idCards';
  selectedItemId?: string | null;
  onFilterChange?: (filter: 'all' | 'loginKeys' | 'notes' | 'idCards') => void;
  onSelectItem?: (itemId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSortClick?: () => void;
  onCreateNote?: () => void;
  onCreateLoginKey?: () => void;
  onCreateIdCard?: () => void;
  onEditNote?: (note: Note) => void;
  onEditLoginKey?: (loginkey: LoginKey) => void;
  onEditIdCard?: (idCard: IdCard) => void;
  onReorderNotes?: (notes: Note[]) => void;
  onReorderLoginKeys?: (loginKeys: LoginKey[]) => void;
  onReorderIdCards?: (idCards: IdCard[]) => void;
  animationKey?: string;
}

export function SecondarySidebar({
  isLocked = false,
  isLoadingContent = false,
  notes,
  loginKeys,
  idCards,
  filterType = 'all',
  selectedItemId,
  onFilterChange,
  onSelectItem,
  searchQuery = '',
  onSearchChange,
  onSortClick,
  onCreateNote,
  onCreateLoginKey,
  onCreateIdCard,
  onEditNote,
  onEditLoginKey,
  onEditIdCard,
  onReorderNotes,
  onReorderLoginKeys,
  onReorderIdCards,
  animationKey,
}: SecondarySidebarProps) {
  const [loginKeysExpanded, setLoginKeysExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [idCardsExpanded, setIdCardsExpanded] = useState(false);

  useEffect(() => {
    if (!isLocked && animationKey) {
      setLoginKeysExpanded(true);
      const timer = setTimeout(() => {
        setNotesExpanded(true);
        setIdCardsExpanded(true);
      }, 150);
      return () => clearTimeout(timer);
    } else if (isLocked) {
      setLoginKeysExpanded(false);
      setNotesExpanded(false);
      setIdCardsExpanded(false);
    }
  }, [isLocked, animationKey]);

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

  const filteredByTypeLoginKeys = filterType === 'notes' || filterType === 'idCards' ? [] : loginKeys;
  const filteredByTypeNotes = filterType === 'loginKeys' || filterType === 'idCards' ? [] : notes;
  const filteredByTypeIdCards = filterType === 'loginKeys' || filterType === 'notes' ? [] : idCards;

  const filteredLoginKeys = filteredByTypeLoginKeys.filter(matchesLoginKeySearch);
  const filteredNotes = filteredByTypeNotes.filter(matchesNoteSearch);
  const filteredIdCards = filteredByTypeIdCards.filter(matchesIdCardSearch);

  const buttons = [
    { icon: <BadgeIcon />, label: 'ID', onClick: onCreateIdCard },
    { icon: <CreditCardIcon />, label: 'Credit Card', onClick: undefined },
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
          hasLoginKeys={loginKeys.length > 0}
          hasNotes={notes.length > 0}
          hasIdCards={idCards.length > 0}
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
