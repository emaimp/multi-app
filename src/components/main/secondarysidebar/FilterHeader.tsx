import { useState } from 'react';
import { Box, IconButton, TextField, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import BadgeIcon from '@mui/icons-material/Badge';
import CreditCardIcon from '@mui/icons-material/CreditCard';

type FilterType = 'all' | 'loginKeys' | 'notes' | 'idCards' | 'creditCards';

interface FilterHeaderProps {
  onSortClick?: () => void;
  filterType?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  hasLoginKeys?: boolean;
  hasNotes?: boolean;
  hasIdCards?: boolean;
  hasCreditCards?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function FilterHeader({
  onSortClick,
  filterType = 'all',
  onFilterChange,
  hasLoginKeys = true,
  hasNotes = true,
  hasIdCards = true,
  hasCreditCards = true,
  searchQuery = '',
  onSearchChange,
}: FilterHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectFilter = (filter: FilterType) => {
    onFilterChange?.(filter);
    handleClose();
  };

  const getFilterIcon = () => {
    switch (filterType) {
      case 'loginKeys':
        return <LoginIcon sx={{ fontSize: 20 }} />;
      case 'notes':
        return <NoteIcon sx={{ fontSize: 20 }} />;
      case 'idCards':
        return <BadgeIcon sx={{ fontSize: 20 }} />;
      case 'creditCards':
        return <CreditCardIcon sx={{ fontSize: 20 }} />;
      default:
        return <FilterListIcon sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        gap: 1,
      }}
    >
      <Tooltip title="Filter" arrow>
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            borderRadius: 1,
            bgcolor: filterType !== 'all' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {getFilterIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem 
          onClick={() => handleSelectFilter('all')}
          selected={filterType === 'all'}
        >
          <ListItemIcon>
            <SelectAllIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>All</ListItemText>
        </MenuItem>
        {hasLoginKeys && (
          <MenuItem 
            onClick={() => handleSelectFilter('loginKeys')}
            selected={filterType === 'loginKeys'}
          >
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Login Keys</ListItemText>
          </MenuItem>
        )}
        {hasNotes && (
          <MenuItem 
            onClick={() => handleSelectFilter('notes')}
            selected={filterType === 'notes'}
          >
            <ListItemIcon>
              <NoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Notes</ListItemText>
          </MenuItem>
        )}
        {hasIdCards && (
          <MenuItem 
            onClick={() => handleSelectFilter('idCards')}
            selected={filterType === 'idCards'}
          >
            <ListItemIcon>
              <BadgeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>ID Cards</ListItemText>
          </MenuItem>
        )}
        {hasCreditCards && (
          <MenuItem 
            onClick={() => handleSelectFilter('creditCards')}
            selected={filterType === 'creditCards'}
          >
            <ListItemIcon>
              <CreditCardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Credit Cards</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <TextField
        size="small"
        placeholder="Search..."
        variant="standard"
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.target.value)}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
      />
      {onSortClick && (
        <Tooltip title="Sort alphabetically" arrow>
          <IconButton
            onClick={onSortClick}
            size="medium"
            sx={{
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SortByAlphaIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default FilterHeader;
