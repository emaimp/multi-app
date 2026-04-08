import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { CreditCard } from '../../../../types/credit_card';
import { CreditCardItem } from './CreditCardItem';

interface CreditCardListProps {
  creditCards: CreditCard[];
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateCreditCard: (creditCardId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color: string) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

interface CreditCardItemComponentProps {
  creditCard: CreditCard;
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateCreditCard: (creditCardId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color: string) => void;
}

function CreditCardItemComponent({ creditCard, isLockedByDefault, onUpdateCreditCard, animationKey }: CreditCardItemComponentProps) {
  return (
    <motion.div
      key={`${animationKey}-${creditCard.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <CreditCardItem
        creditCard={creditCard}
        isLockedByDefault={isLockedByDefault}
        onUpdate={onUpdateCreditCard}
      />
    </motion.div>
  );
}

export function CreditCardList({ creditCards, isLockedByDefault, animationKey, onUpdateCreditCard }: CreditCardListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {creditCards.map((creditCard) => (
        <CreditCardItemComponent
          key={creditCard.id}
          creditCard={creditCard}
          isLockedByDefault={isLockedByDefault}
          animationKey={animationKey}
          onUpdateCreditCard={onUpdateCreditCard}
        />
      ))}
    </Box>
  );
}

export default CreditCardList;