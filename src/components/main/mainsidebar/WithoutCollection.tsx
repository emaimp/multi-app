import { Box, Typography } from '@mui/material';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { SortableItemCard } from '../cards/SortableItemCard';

interface WithoutCollectionProps {
  vaults: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
  onReorder: (vaults: Vault[]) => void;
}

export function WithoutCollection({
  vaults,
  onVaultClick,
  onEditVault,
  activeVault,
  onReorder,
}: WithoutCollectionProps) {
  const sensors = useSortableSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = vaults.findIndex((v) => v.id === active.id);
      const newIndex = vaults.findIndex((v) => v.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedVaults = arrayMove(vaults, oldIndex, newIndex);
        onReorder(reorderedVaults);
      }
    }
  };

  if (vaults.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, py: 1, display: 'block', fontWeight: 'medium' }}
      >
        Without Collection ({vaults.length})
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={vaults.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ py: 0.1, px: 0.1, overflow: 'hidden' }}>
            {vaults.map((vault) => (
              <SortableItemCard
                key={vault.id}
                item={vault}
                title={vault.name}
                color={vault.color}
                colorPalette={VAULT_COLORS_HEX}
                avatarSrc={vault.image}
                avatarFallback={vault.name.charAt(0).toUpperCase()}
                isSelected={activeVault === vault.id}
                onClick={() => onVaultClick(vault.id)}
                onEdit={onEditVault}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}

export default WithoutCollection;
