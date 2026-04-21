import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { IdCard } from '../../../../types/id_card';
import { IdCardItem } from './IdCardItem';

interface IdCardListProps {
  idCards: IdCard[];
  isLockedByDefault?: boolean;
  newlyCreatedId?: string | null;
  animationKey?: string;
  onUpdateIdCard: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color: string) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

interface IdCardItemComponentProps {
  idCard: IdCard;
  isLockedByDefault?: boolean;
  newlyCreatedId?: string | null;
  animationKey?: string;
  onUpdateIdCard: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color: string) => void;
}

function IdCardItemComponent({ idCard, isLockedByDefault, newlyCreatedId, onUpdateIdCard, animationKey }: IdCardItemComponentProps) {
  return (
    <motion.div
      key={`${animationKey}-${idCard.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <IdCardItem
        idCard={idCard}
        isLockedByDefault={isLockedByDefault}
        newlyCreatedId={newlyCreatedId}
        onUpdate={onUpdateIdCard}
      />
    </motion.div>
  );
}

export function IdCardList({ idCards, isLockedByDefault, newlyCreatedId, animationKey, onUpdateIdCard }: IdCardListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {idCards.map((idCard) => (
        <IdCardItemComponent
          key={idCard.id}
          idCard={idCard}
          isLockedByDefault={isLockedByDefault}
          newlyCreatedId={newlyCreatedId}
          animationKey={animationKey}
          onUpdateIdCard={onUpdateIdCard}
        />
      ))}
    </Box>
  );
}

export default IdCardList;