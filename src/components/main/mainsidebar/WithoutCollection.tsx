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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { ItemCard } from '../cards/ItemCard';

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
          {vaults.map((vault) => (
            <SortableVaultItem
              key={vault.id}
              vault={vault}
              onVaultClick={onVaultClick}
              onEditVault={onEditVault}
              activeVault={activeVault}
            />
          ))}
        </SortableContext>
      </DndContext>
    </Box>
  );
}

interface SortableVaultItemProps {
  vault: Vault;
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
}

function SortableVaultItem({
  vault,
  onVaultClick,
  onEditVault,
  activeVault,
}: SortableVaultItemProps) {
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
    <Box ref={setNodeRef} style={style} sx={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <ItemCard
        title={vault.name}
        color={vault.color}
        colorPalette={VAULT_COLORS_HEX}
        avatarSrc={vault.image}
        avatarFallback={vault.name.charAt(0).toUpperCase()}
        item={vault}
        onEdit={onEditVault}
        onClick={() => onVaultClick(vault.id)}
        isSelected={activeVault === vault.id}
        isDragging={isDragging}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export default WithoutCollection;
