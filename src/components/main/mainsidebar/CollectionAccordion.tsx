import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { Collection } from '../../../types/collection';
import { Vault, VAULT_COLORS_HEX } from '../../../types/vault';
import { ItemCard } from '../cards/ItemCard';

interface CollectionAccordionProps {
  collection: Collection;
  vaults?: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  onEditCollection?: (collection: Collection) => void;
  activeVault: string | null;
  dragAttributes?: any;
  dragListeners?: any;
  onVaultReorder?: (collectionId: string, vault_ids: string[]) => void;
  isGeneral?: boolean;
  defaultExpanded?: boolean;
}

export function CollectionAccordion({
  collection,
  vaults = [],
  onVaultClick,
  onEditVault,
  onEditCollection,
  activeVault,
  dragAttributes,
  dragListeners,
  onVaultReorder,
  isGeneral = false,
  defaultExpanded = false,
}: CollectionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);
  
  const sensors = useSortableSensors();

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
        {onEditCollection ? (
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              onEditCollection(collection);
            }}
            sx={{ 
              mr: 1, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              p: 0.5,
            }}
          >
            <MoreVertIcon fontSize="small" />
          </Box>
        ) : isGeneral ? (
          <Box sx={{ width: 28, mr: 1 }} />
        ) : null}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {collection.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({vault_ids.length})
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0.1, px: 0.1, overflow: 'hidden' }}>
        {vault_ids.length > 0 ? (
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
                  <SortableVaultItem
                    key={vault.id}
                    vault={vault}
                    onVaultClick={onVaultClick}
                    onEditVault={onEditVault}
                    activeVault={activeVault}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 4 }}>
            No vaults in this collection
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

interface SortableVaultItemProps {
  vault: Vault;
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
}

function SortableVaultItem({ vault, onVaultClick, onEditVault, activeVault }: SortableVaultItemProps) {
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

export default CollectionAccordion;
