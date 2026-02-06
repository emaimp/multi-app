import { Box, Avatar, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Vault } from '../../types/vault';

interface VaultCardProps {
  vault: Vault;
  onEdit: (vault: Vault) => void;
}

const VAULT_COLORS_HEX: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0891b2',
};

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
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default VaultCard;
