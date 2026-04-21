import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { CreditCard, CREDITCARD_COLORS_HEX } from '../../../../types/credit_card';

interface CreditCardItemProps {
  creditCard: CreditCard;
  isLockedByDefault?: boolean;
  newlyCreatedId?: string | null;
  onUpdate: (creditCardId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color: string) => void;
}

export function CreditCardItem({ creditCard, isLockedByDefault = false, newlyCreatedId, onUpdate }: CreditCardItemProps) {
  const [holderName, setHolderName] = useState(creditCard.holder_name);
  const [cardNumber, setCardNumber] = useState(creditCard.card_number);
  const [expiry, setExpiry] = useState(creditCard.expiry);
  const [cvv, setCvv] = useState(creditCard.cvv);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const isInitiallyUnlocked = newlyCreatedId === creditCard.id;
  const [isLocked, setIsLocked] = useState(isInitiallyUnlocked ? false : isLockedByDefault);

  useEffect(() => {
    setHolderName(creditCard.holder_name);
    setCardNumber(creditCard.card_number);
    setExpiry(creditCard.expiry);
    setCvv(creditCard.cvv);
  }, [creditCard]);

  const colorHex = CREDITCARD_COLORS_HEX[creditCard.color] || CREDITCARD_COLORS_HEX.blue;

  const handleSave = () => {
    onUpdate(creditCard.id, creditCard.card_name, holderName, cardNumber, expiry, cvv, creditCard.color);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyNumber = async () => {
    if (cardNumber) {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        mb: 2,
        boxShadow: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1,
          py: 1,
          bgcolor: colorHex + '20',
          borderBottom: '2px solid',
          borderColor: colorHex,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            opacity: isLocked ? 0.7 : 1,
            px: 0.5,
          }}
        >
          {creditCard.card_name || 'Untitled Credit Card'}
        </Typography>

        <IconButton
          size="small"
          onClick={handleSave}
          sx={{
            color: saved ? 'success.main' : 'inherit',
            opacity: saved ? 1 : 0.6,
            '&:hover': { opacity: 1 },
          }}
        >
          {saved ? <CheckIcon fontSize="small" /> : <SaveIcon fontSize="small" />}
        </IconButton>

        <IconButton
          size="small"
          onClick={() => setIsLocked(!isLocked)}
          sx={{
            color: isLocked ? 'success.main' : 'inherit',
            opacity: isLocked ? 1 : 0.6,
            '&:hover': { opacity: 1 },
          }}
        >
          {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Holder Name"
          value={holderName}
          onChange={(e) => !isLocked && setHolderName(e.target.value)}
          placeholder="Name on card"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="Card Number"
          value={cardNumber}
          onChange={(e) => !isLocked && setCardNumber(e.target.value)}
          placeholder="1234 5678 9012 3456"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 1, mr: -1 }}>
                <IconButton
                  size="small"
                  onClick={handleCopyNumber}
                  disabled={isLocked || !cardNumber}
                  sx={{
                    color: copied ? 'success.main' : 'inherit',
                    opacity: copied ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="Expiry"
          value={expiry}
          onChange={(e) => !isLocked && setExpiry(e.target.value)}
          placeholder="MM/YY"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="CVV"
          value={cvv}
          onChange={(e) => !isLocked && setCvv(e.target.value)}
          placeholder="123"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default CreditCardItem;