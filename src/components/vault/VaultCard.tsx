import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';
import { AvatarDisplay } from '../ui';

interface VaultCardProps {
  vault: Vault;
  onEdit: (vault: Vault) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}

export function VaultCard({ vault, onEdit, onClick, isSelected, isDragging, dragAttributes, dragListeners }: VaultCardProps) {
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
        cursor: isDragging ? 'grabbing' : 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      {...dragAttributes}
      {...dragListeners}
    >
      <AvatarDisplay
        src={vault.image}
        fallback={vault.name.charAt(0).toUpperCase()}
      />

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
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default VaultCard;
