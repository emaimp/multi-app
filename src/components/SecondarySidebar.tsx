import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import { FilterHeader } from './ui/headers/FilterHeader';

interface SecondarySidebarProps {
  open: boolean;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onNoteClick?: () => void;
  children?: React.ReactNode;
}

export function SecondarySidebar({
  open,
  onFilterClick,
  onSortClick,
  onNoteClick,
  children,
}: SecondarySidebarProps) {

  const buttons = [
    { icon: <BadgeIcon />, label: 'ID', onClick: undefined },
    { icon: <CreditCardIcon />, label: 'Credit Card', onClick: undefined },
    { icon: <LoginIcon />, label: 'Login', onClick: undefined },
    { icon: <NoteIcon />, label: 'Note', onClick: onNoteClick },
  ];

  return (
    <Box
      sx={{
        width: open ? 250 : 5,
        flexShrink: 0,
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflowX: 'hidden',
        transition: 'width 250ms ease-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 60,
          p: 2,
          bgcolor: 'action.hover',
          transition: 'opacity 200ms ease-out',
          opacity: open ? 1 : 0,
        }}
      >
        <FilterHeader
          onSortClick={onSortClick}
          onFilterClick={onFilterClick}
        />
      </Box>

      <Divider
        sx={{
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease-out'
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          p: 2.2,
          borderBottom: 1,
          borderColor: 'divider',
          transition: 'opacity 200ms ease-out',
          opacity: open ? 1 : 0,
        }}
      >
        {buttons.map((btn, index) => (
          <Tooltip key={index} title={btn.label} arrow>
            <IconButton
              size="small"
              onClick={btn.onClick}
              disabled={!btn.onClick}
              sx={{
                bgcolor: 'action.selected',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {btn.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

export default SecondarySidebar;
