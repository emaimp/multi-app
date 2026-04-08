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
import { Note, NOTE_COLORS_HEX } from '../../../types/note';
import { LoginKey, LOGINKEY_COLORS_HEX } from '../../../types/loginkey';
import { IdCard, IDCARD_COLORS_HEX } from '../../../types/id_card';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableItemCard } from '../cards/SortableItemCard';

interface CategoryAccordionLoginKeysProps {
  title: string;
  icon?: React.ReactNode;
  items: LoginKey[];
  type: 'loginKeys';
  selectedItemId?: string | null;
  onSelectItem?: (itemId: string | null) => void;
  onEditItem?: (item: LoginKey) => void;
  onReorder?: (items: LoginKey[]) => void;
  defaultExpanded?: boolean;
  animationKey?: string;
}

interface CategoryAccordionNotesProps {
  title: string;
  icon?: React.ReactNode;
  items: Note[];
  type: 'notes';
  selectedItemId?: string | null;
  onSelectItem?: (itemId: string | null) => void;
  onEditItem?: (item: Note) => void;
  onReorder?: (items: Note[]) => void;
  defaultExpanded?: boolean;
  animationKey?: string;
}

interface CategoryAccordionIdCardsProps {
  title: string;
  icon?: React.ReactNode;
  items: IdCard[];
  type: 'idCards';
  selectedItemId?: string | null;
  onSelectItem?: (itemId: string | null) => void;
  onEditItem?: (item: IdCard) => void;
  onReorder?: (items: IdCard[]) => void;
  defaultExpanded?: boolean;
  animationKey?: string;
}

type CategoryAccordionProps = CategoryAccordionLoginKeysProps | CategoryAccordionNotesProps | CategoryAccordionIdCardsProps;

export function CategoryAccordion({
  title,
  icon,
  items,
  type,
  selectedItemId,
  onSelectItem,
  onEditItem,
  onReorder,
  defaultExpanded = true,
  animationKey,
}: CategoryAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

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

  const sensors = useSortableSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        if (type === 'loginKeys') {
          const reorderedItems = arrayMove(items as LoginKey[], oldIndex, newIndex);
          onReorder(reorderedItems as any);
        } else if (type === 'notes') {
          const reorderedItems = arrayMove(items as Note[], oldIndex, newIndex);
          onReorder(reorderedItems as any);
        } else {
          const reorderedItems = arrayMove(items as IdCard[], oldIndex, newIndex);
          onReorder(reorderedItems as any);
        }
      }
    }
  };

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 4 }}>
          No {type === 'loginKeys' ? 'login keys' : type === 'notes' ? 'notes' : 'id cards'} yet
        </Typography>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {type === 'loginKeys' ? (
            (items as LoginKey[]).map((loginkey) => (
              <motion.div
                key={`${animationKey}-${loginkey.id}`}
                initial="hidden"
                animate="visible"
                variants={variants}
              >
                <SortableItemCard
                  item={loginkey}
                  title={loginkey.site_name}
                  color={loginkey.color}
                  colorPalette={LOGINKEY_COLORS_HEX}
                  avatarSrc={loginkey.image}
                  avatarFallback={loginkey.site_name.charAt(0).toUpperCase()}
                  isSelected={selectedItemId === loginkey.id}
                  onClick={() => onSelectItem?.(loginkey.id)}
                  onEdit={onEditItem as (item: LoginKey) => void}
                />
              </motion.div>
            ))
          ) : type === 'notes' ? (
            (items as Note[]).map((note) => (
              <motion.div
                key={`${animationKey}-${note.id}`}
                initial="hidden"
                animate="visible"
                variants={variants}
              >
                <SortableItemCard
                  item={note}
                  title={note.title}
                  color={note.color}
                  colorPalette={NOTE_COLORS_HEX}
                  avatarSrc={note.image}
                  avatarFallback={note.title.charAt(0).toUpperCase()}
                  isSelected={selectedItemId === note.id}
                  onClick={() => onSelectItem?.(note.id)}
                  onEdit={onEditItem as (item: Note) => void}
                />
              </motion.div>
            ))
          ) : (
            (items as IdCard[]).map((idCard) => (
              <motion.div
                key={`${animationKey}-${idCard.id}`}
                initial="hidden"
                animate="visible"
                variants={variants}
              >
                <SortableItemCard
                  item={idCard}
                  title={idCard.id_name}
                  color={idCard.color}
                  colorPalette={IDCARD_COLORS_HEX}
                  avatarSrc={idCard.image}
                  avatarFallback={idCard.id_name.charAt(0).toUpperCase()}
                  isSelected={selectedItemId === idCard.id}
                  onClick={() => onSelectItem?.(idCard.id)}
                  onEdit={onEditItem as (item: IdCard) => void}
                />
              </motion.div>
            ))
          )}
        </SortableContext>
      </DndContext>
    );
  };

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
        expandIcon={<ExpandMoreIcon />}
        sx={{
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          pl: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {icon}
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({items.length})
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0.1, px: 0.1, overflow: 'hidden' }}>
        {renderItems()}
      </AccordionDetails>
    </Accordion>
  );
}

export default CategoryAccordion;
