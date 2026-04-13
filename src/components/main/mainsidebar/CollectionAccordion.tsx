import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { Collection } from '../../../types/collection';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { SortableItemCard } from '../cards/SortableItemCard';

interface CollectionAccordionProps {
  collection: Collection;
  vaults?: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
  dragAttributes?: any;
  dragListeners?: any;
  onVaultReorder?: (collectionId: string, vault_ids: string[]) => void;
  defaultExpanded?: boolean;
  animationKey?: string;
}

export function CollectionAccordion({
  collection,
  vaults = [],
  onVaultClick,
  onEditVault,
  activeVault,
  dragAttributes,
  dragListeners,
  onVaultReorder,
  defaultExpanded = false,
  animationKey,
}: CollectionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);
  
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

  const handleVaultDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onVaultReorder) {
      const oldIndex = collection.vault_ids.indexOf(active.id as string);
      const newIndex = collection.vault_ids.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newVaultIds = arrayMove(collection.vault_ids, oldIndex, newIndex);
        onVaultReorder(collection.id, newVaultIds);
      }
    }
  };

  const vault_ids = collection.vault_ids;

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      sx={{
        boxShadow: 'none',
        '&:before': { display: 'none' },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AccordionSummary
        {...dragAttributes}
        {...dragListeners}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          cursor: 'grab',
          '&:hover': { bgcolor: 'action.hover' },
          pl: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <ViewModuleIcon fontSize="small" />
          <Typography variant="subtitle1" fontWeight="medium">
            {collection.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({vault_ids.length})
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0.1, px: 0.1, overflow: 'hidden' }}>
        {vault_ids.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleVaultDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={vault_ids} strategy={verticalListSortingStrategy}>
              {vault_ids.map((vaultId) => {
                const vault = vaults.find(v => v.id === vaultId);
                if (!vault) return null;
                return (
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
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CollectionAccordion;
