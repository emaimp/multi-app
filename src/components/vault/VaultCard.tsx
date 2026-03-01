import { Box, Avatar, Typography, IconButton } from '@mui/material';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';

interface VaultCardProps {
  vault: Vault;
  onEdit: (vault: Vault) => void;
  onClick?: () => void;
  isSelected?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}

export function VaultCard({ vault, onEdit, onClick, isSelected, dragAttributes, dragListeners }: VaultCardProps) {
  const colorHex = VAULT_COLORS_HEX[vault.color] || VAULT_COLORS_HEX.primary;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1,
        borderLeft: '4px solid',
        borderLeftColor: colorHex,
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          color: 'text.primary',
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
        }}
        src={vault.image}
      >
        {vault.name.charAt(0).toUpperCase()}
      </Avatar>

      <Typography
        variant="body1"
        sx={{
          flexGrow: 1,
          ml: 2,
          fontWeight: 500,
        }}
      >
        {vault.name}
      </Typography>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(vault);
        }}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <EditSquareIcon fontSize="small" />
      </IconButton>

      {dragListeners && (
        <DragIndicatorIcon
          sx={{
            color: 'action.active',
            cursor: 'grab',
            ml: 1,
          }}
          {...dragAttributes}
          {...dragListeners}
        />
      )}
    </Box>
  );
}

export default VaultCard;
