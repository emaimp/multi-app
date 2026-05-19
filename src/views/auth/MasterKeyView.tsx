import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';

interface MasterKeyViewProps {
  masterKey: string;
  isLoading: boolean;
  success?: string;
  onSuccessClose?: () => void;
  onSignUp: () => void;
  onBack: () => void;
}

export function MasterKeyView({
  masterKey,
  isLoading,
  success,
  onSuccessClose,
  onSignUp,
  onBack,
}: MasterKeyViewProps) {
  const { t } = useTranslation();
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

  const handleConfirm = () => {
    onSignUp();
  };

  return (
    <>
      <TopBar onBack={onBack} />
      <CenteredCard success={success} onSuccessClose={onSuccessClose}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: '100%',
            fontSize: 'clamp(1.5rem, 8vw, 2rem)',
            textAlign: 'center',
            mb: 2,
          }}
        >
          {t('register.masterKeyTitle')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('register.masterKeyDescription')}
        </Typography>

        <Box sx={{ mb: 3 }}>
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
          label={t('register.masterKeySaved')}
          sx={{ mb: 2 }}
        />

        <Button
          onClick={handleConfirm}
          variant="contained"
          fullWidth
          disabled={!acknowledged || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {t('login.signUp')}
        </Button>
      </CenteredCard>
    </>
  );
}

export default MasterKeyView;