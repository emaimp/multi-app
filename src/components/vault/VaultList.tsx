import { Box, List, Typography } from '@mui/material';
import { Vault } from '../../types/vault';
import { VaultCard } from './VaultCard';

interface VaultListProps {
  vaults: Vault[];
  onEditVault: (vault: Vault) => void;
}

export function VaultList({ vaults, onEditVault }: VaultListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <List>
        {vaults.map((vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            onEdit={onEditVault}
          />
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
