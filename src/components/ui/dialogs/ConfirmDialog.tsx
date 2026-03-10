import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (masterKey?: string) => void;
  onCancel: () => void;
  showMasterKey?: boolean;
  label?: string;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  showMasterKey = false,
  label = 'Master Key',
  placeholder,
  error,
  isLoading = false,
}: ConfirmDialogProps) {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const displayError = localError || error || '';

  const handleSubmit = () => {
    if (showMasterKey && !value.trim()) {
      setLocalError('Master key is required');
      return;
    }
    onConfirm(value);
  };

  const handleClose = () => {
    setValue('');
    setLocalError('');
    setShowPassword(false);
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 3 }}>{message}</Typography>
        {showMasterKey && (
          <TextField
            autoFocus
            margin="dense"
            label={label}
            placeholder={placeholder}
            fullWidth
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setLocalError('');
            }}
            error={!!displayError}
            helperText={displayError}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="error"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
