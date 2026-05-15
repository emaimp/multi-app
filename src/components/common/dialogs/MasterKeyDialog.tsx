import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface MasterKeyDialogProps {
  open: boolean;
  masterKey: string;
  onClose: () => void;
}

export function MasterKeyDialog({
  open,
  masterKey,
  onClose,
}: MasterKeyDialogProps) {
  const [showKey, setShowKey] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(masterKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setShowKey(false);
    setAcknowledged(false);
    setCopied(false);
    onClose();
  };

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        Save Your Master Key
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This is crucial! Your Master Key cannot be recovered if lost.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your Master Key is displayed below. You will need it to recover your account 
          if you forget your password. Write it down or save it in a secure password manager.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={masterKey}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <IconButton onClick={handleCopy} edge="start" title="Copy to clipboard">
                  <ContentCopyIcon color={copied ? 'success' : 'action'} />
                </IconButton>
              ),
              endAdornment: (
                <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                  {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
            type={showKey ? 'text' : 'password'}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              },
            }}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              color="primary"
            />
          }
          label="I have saved my Master Key in a secure place"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!acknowledged}
        >
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MasterKeyDialog;