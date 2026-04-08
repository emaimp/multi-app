import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { IdCard, IDCARD_COLORS_HEX } from '../../../../types/id_card';

interface IdCardItemProps {
  idCard: IdCard;
  isLockedByDefault?: boolean;
  onUpdate: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color: string) => void;
}

export function IdCardItem({ idCard, isLockedByDefault = false, onUpdate }: IdCardItemProps) {
  const [idType, setIdType] = useState(idCard.id_type);
  const [fullName, setFullName] = useState(idCard.full_name);
  const [idNumber, setIdNumber] = useState(idCard.id_number);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLocked, setIsLocked] = useState(isLockedByDefault);

  useEffect(() => {
    setIdType(idCard.id_type);
    setFullName(idCard.full_name);
    setIdNumber(idCard.id_number);
  }, [idCard]);

  const colorHex = IDCARD_COLORS_HEX[idCard.color] || IDCARD_COLORS_HEX.blue;

  const handleSave = () => {
    onUpdate(idCard.id, idCard.id_name, idType, fullName, idNumber, idCard.color);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyNumber = async () => {
    if (idNumber) {
      await navigator.clipboard.writeText(idNumber);
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
          {idCard.id_name || 'Untitled ID Card'}
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
          label="ID Type"
          value={idType}
          onChange={(e) => !isLocked && setIdType(e.target.value)}
          placeholder="DNI, Passport, License..."
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
          label="Full Name"
          value={fullName}
          onChange={(e) => !isLocked && setFullName(e.target.value)}
          placeholder="Full name on ID"
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
          label="ID Number"
          value={idNumber}
          onChange={(e) => !isLocked && setIdNumber(e.target.value)}
          placeholder="ID number"
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
                  disabled={isLocked || !idNumber}
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
        />
      </Box>
    </Box>
  );
}

export default IdCardItem;