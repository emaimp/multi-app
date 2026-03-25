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
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemCard } from '../cards/ItemCard';
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';

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

type CategoryAccordionProps = CategoryAccordionLoginKeysProps | CategoryAccordionNotesProps;

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = [...items];
        const [removed] = reorderedItems.splice(oldIndex, 1);
        reorderedItems.splice(newIndex, 0, removed);
        if (type === 'loginKeys') {
          (onReorder as (items: LoginKey[]) => void)(reorderedItems as LoginKey[]);
        } else {
          (onReorder as (items: Note[]) => void)(reorderedItems as Note[]);
        }
      }
    }
  };

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 4 }}>
          No {type === 'loginKeys' ? 'login keys' : 'notes'} yet
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
                <SortableLoginkeyCardWrapper
                  loginkey={loginkey}
                  selected={selectedItemId === loginkey.id}
                  onSelect={onSelectItem}
                  onEdit={onEditItem as (item: LoginKey) => void}
                />
              </motion.div>
            ))
          ) : (
            (items as Note[]).map((note) => (
              <motion.div
                key={`${animationKey}-${note.id}`}
                initial="hidden"
                animate="visible"
                variants={variants}
              >
                <SortableNoteCardWrapper
                  note={note}
                  selected={selectedItemId === note.id}
                  onSelect={onSelectItem}
                  onEdit={onEditItem as (item: Note) => void}
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
      <AccordionDetails sx={{ py: 0, px: 0, overflowX: 'hidden' }}>
        {renderItems()}
      </AccordionDetails>
    </Accordion>
  );
}

interface SortableLoginkeyCardWrapperProps {
  loginkey: LoginKey;
  selected?: boolean;
  onSelect?: (id: string | null) => void;
  onEdit: (loginkey: LoginKey) => void;
}

function SortableLoginkeyCardWrapper({ loginkey, selected, onSelect, onEdit }: SortableLoginkeyCardWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: loginkey.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <ItemCard
        title={loginkey.site_name}
        color={loginkey.color}
        colorPalette={LOGINKEY_COLORS_HEX}
        avatarSrc={loginkey.image}
        avatarFallback={loginkey.site_name.charAt(0).toUpperCase()}
        item={loginkey}
        onEdit={onEdit}
        onClick={() => onSelect?.(loginkey.id)}
        isSelected={selected}
        isDragging={isDragging}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

interface SortableNoteCardWrapperProps {
  note: Note;
  selected?: boolean;
  onSelect?: (id: string | null) => void;
  onEdit: (note: Note) => void;
}

function SortableNoteCardWrapper({ note, selected, onSelect, onEdit }: SortableNoteCardWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <ItemCard
        title={note.title}
        color={note.color}
        colorPalette={NOTE_COLORS_HEX}
        avatarSrc={note.image}
        avatarFallback={note.title.charAt(0).toUpperCase()}
        item={note}
        onEdit={onEdit}
        onClick={() => onSelect?.(note.id)}
        isSelected={selected}
        isDragging={isDragging}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export default CategoryAccordion;
