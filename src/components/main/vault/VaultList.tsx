import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { ItemCard } from '../cards/ItemCard';

interface VaultListProps {
  vaults: Vault[];
  onUpdateVault: (vault: Vault) => void;
  onVaultClick?: (vaultId: string) => void;
  activeVault?: string | null;
}

function SortableVaultItem({ vault, onUpdateVault, onVaultClick, activeVault }: { vault: Vault; onUpdateVault: (vault: Vault) => void; onVaultClick?: (vaultId: string) => void; activeVault?: string | null }) {
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
      <ItemCard
        title={vault.name}
        color={vault.color}
        colorPalette={VAULT_COLORS_HEX}
        avatarSrc={vault.image}
        avatarFallback={vault.name.charAt(0).toUpperCase()}
        item={vault}
        onEdit={onUpdateVault}
        onClick={() => onVaultClick?.(vault.id)}
        isSelected={activeVault === vault.id}
        isDragging={isDragging}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function VaultList({ vaults, onUpdateVault, onVaultClick, activeVault }: VaultListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {vaults.map((vault) => (
        <SortableVaultItem
          key={vault.id}
          vault={vault}
          onUpdateVault={onUpdateVault}
          onVaultClick={onVaultClick}
          activeVault={activeVault}
        />
      ))}
    </Box>
  );
}

export default VaultList;
