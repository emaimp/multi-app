import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
  const [copiedHolderName, setCopiedHolderName] = useState(false);
  const [copiedCardNumber, setCopiedCardNumber] = useState(false);
  const [copiedCvv, setCopiedCvv] = useState(false);
  const [showHolderName, setShowHolderName] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
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

  const handleCopyCardNumber = async () => {
    if (cardNumber) {
      await navigator.clipboard.writeText(cardNumber);
      setCopiedCardNumber(true);
      setTimeout(() => setCopiedCardNumber(false), 3000);
    }
  };

  const handleCopyCvv = async () => {
    if (cvv) {
      await navigator.clipboard.writeText(cvv);
      setCopiedCvv(true);
      setTimeout(() => setCopiedCvv(false), 3000);
    }
  };

  const handleCopyHolderName = async () => {
    if (holderName) {
      await navigator.clipboard.writeText(holderName);
      setCopiedHolderName(true);
      setTimeout(() => setCopiedHolderName(false), 3000);
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
          type={showHolderName ? 'text' : 'password'}
          label="Holder Name"
          value={holderName}
          onChange={(e) => !isLocked && setHolderName(e.target.value)}
          placeholder="Name on card"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 1, mr: -1 }}>
                <IconButton
                  size="small"
                  onClick={() => setShowHolderName(!showHolderName)}
                  edge="end"
                  sx={{ opacity: 0.6 }}
                >
                  {showHolderName ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCopyHolderName}
                  disabled={isLocked || !holderName}
                  sx={{
                    color: copiedHolderName ? 'success.main' : 'inherit',
                    opacity: copiedHolderName ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copiedHolderName ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          type={showCardNumber ? 'text' : 'password'}
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
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  edge="end"
                  sx={{ opacity: 0.6 }}
                >
                  {showCardNumber ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCopyCardNumber}
                  disabled={isLocked || !cardNumber}
                  sx={{
                    color: copiedCardNumber ? 'success.main' : 'inherit',
                    opacity: copiedCardNumber ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copiedCardNumber ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
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
          type={showCvv ? 'text' : 'password'}
          label="CVV"
          value={cvv}
          onChange={(e) => !isLocked && setCvv(e.target.value)}
          placeholder="123"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 1, mr: -1 }}>
                <IconButton
                  size="small"
                  onClick={() => setShowCvv(!showCvv)}
                  edge="end"
                  sx={{ opacity: 0.6 }}
                >
                  {showCvv ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCopyCvv}
                  disabled={isLocked || !cvv}
                  sx={{
                    color: copiedCvv ? 'success.main' : 'inherit',
                    opacity: copiedCvv ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copiedCvv ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}

export default CreditCardItem;