import { Box, List, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Vault } from '../../types/vault';
import { VaultCard } from './VaultCard';

interface VaultListProps {
  vaults: Vault[];
  onEditVault: (vault: Vault) => void;
  onVaultClick: (vaultId: string) => void;
  selectedVaultId: string | null;
}

interface SortableVaultItemProps {
  vault: Vault;
  onEditVault: (vault: Vault) => void;
  onVaultClick: (vaultId: string) => void;
  selectedVaultId: string | null;
}

function SortableVaultItem({ vault, onEditVault, onVaultClick, selectedVaultId }: SortableVaultItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vault.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <VaultCard
        vault={vault}
        onEdit={onEditVault}
        onClick={() => onVaultClick(vault.id)}
        isSelected={selectedVaultId === vault.id}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function VaultList({ vaults, onEditVault, onVaultClick, selectedVaultId }: VaultListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <List>
        {vaults.map((vault) => (
          <SortableVaultItem
            key={vault.id}
            vault={vault}
            onEditVault={onEditVault}
            onVaultClick={onVaultClick}
            selectedVaultId={selectedVaultId}
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
