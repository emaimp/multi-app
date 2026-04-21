import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
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
import { useSortableSensors } from '../../../hooks/sensors/useSortableSensors';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { SortableItemCard } from '../cards/SortableItemCard';

interface WithoutCollectionProps {
  vaults: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
  onReorder: (vaults: Vault[]) => void;
  animationKey?: string;
}

export function WithoutCollection({
  vaults,
  onVaultClick,
  onEditVault,
  activeVault,
  onReorder,
  animationKey,
}: WithoutCollectionProps) {
  const sensors = useSortableSensors();

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
      },
    },
  } as const;

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
              <motion.div
                key={`${animationKey}-${vault.id}`}
                initial="hidden"
                animate="visible"
                variants={variants}
              >
                <SortableItemCard
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
              </motion.div>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}

export default WithoutCollection;
