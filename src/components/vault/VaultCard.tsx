import { Box, Avatar, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';

interface VaultCardProps {
  vault: Vault;
  onEdit: (vault: Vault) => void;
}

export function VaultCard({ vault, onEdit }: VaultCardProps) {
  const colorHex = VAULT_COLORS_HEX[vault.color] || VAULT_COLORS_HEX.primary;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          border: '3px solid',
          borderColor: colorHex,
          bgcolor: 'transparent',
          color: 'text.primary',
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
        onClick={() => onEdit(vault)}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default VaultCard;
