import { Box, List, Typography } from '@mui/material';
import { Vault } from '../../types/vault';
import { VaultCard } from './VaultCard';

interface VaultListProps {
  vaults: Vault[];
  onEditVault: (vault: Vault) => void;
  onVaultClick: (vaultId: string) => void;
  selectedVaultId: string | null;
}

export function VaultList({ vaults, onEditVault, onVaultClick, selectedVaultId }: VaultListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <List>
        {vaults.map((vault) => (
          <Box
            key={vault.id}
            onClick={() => onVaultClick(vault.id)}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedVaultId === vault.id ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <VaultCard vault={vault} onEdit={onEditVault} />
          </Box>
        ))}
      </List>
      {vaults.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No vaults yet. Click "New Vault" to create one.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default VaultList;
