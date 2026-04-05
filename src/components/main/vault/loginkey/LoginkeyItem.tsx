import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment, Link } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { openUrl } from '@tauri-apps/plugin-opener';
import { LoginKey } from '../../../../types/loginkey';
import { LOGINKEY_COLORS_HEX } from '../../../../types/loginkey';

interface LoginkeyItemProps {
  loginkey: LoginKey;
  isLockedByDefault?: boolean;
  onUpdate: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color: string) => void;
}

export function LoginkeyItem({ loginkey, isLockedByDefault = false, onUpdate }: LoginkeyItemProps) {
  const [url, setUrl] = useState(loginkey.url || '');
  const [username, setUsername] = useState(loginkey.username);
  const [password, setPassword] = useState(loginkey.password);
  const [details, setDetails] = useState(loginkey.details || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLocked, setIsLocked] = useState(isLockedByDefault);

  useEffect(() => {
    setUrl(loginkey.url || '');
    setUsername(loginkey.username);
    setPassword(loginkey.password);
    setDetails(loginkey.details || '');
  }, [loginkey]);

  const colorHex = LOGINKEY_COLORS_HEX[loginkey.color] || LOGINKEY_COLORS_HEX.blue;

  const handleSave = () => {
    onUpdate(loginkey.id, loginkey.site_name, url || null, username, password, details || null, loginkey.color);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyUsername = async () => {
    if (username) {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 3000);
    }
  };

  const handleCopyPassword = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 3000);
    }
  };

  const handleUrlClick = async () => {
    if (isLocked && url) {
      try {
        await openUrl(url);
      } catch (e) {
        console.error('Failed to open URL:', e);
      }
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
          {loginkey.site_name || 'Untitled Login Key'}
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
        {isLocked ? (
          <Box sx={{ mt: 1.5, mb: 3 }}>
            <Typography variant="caption" color="text.secondary">URL</Typography>
            <Link
              component="button"
              onClick={handleUrlClick}
              sx={{
                display: 'block',
                color: colorHex,
                textDecoration: 'none',
                cursor: url ? 'pointer' : 'default',
                opacity: url ? 1 : 0.5,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                '&:hover': url ? {
                  textDecoration: 'underline',
                } : {},
              }}
            >
              {url || 'No URL'}
            </Link>
          </Box>
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            InputProps={{
              sx: {
                fontSize: '0.9rem',
              },
            }}
            sx={{ mt: 1.5, mb: 3 }}
          />
        )}

        <TextField
          fullWidth
          variant="outlined"
          type={showUsername ? 'text' : 'password'}
          label="Email"
          value={username}
          onChange={(e) => !isLocked && setUsername(e.target.value)}
          placeholder="Email / Username"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 1, mr: -1 }}>
                <IconButton
                  size="small"
                  onClick={() => setShowUsername(!showUsername)}
                  edge="end"
                  sx={{ opacity: 0.6 }}
                >
                  {showUsername ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCopyUsername}
                  sx={{
                    color: copiedUsername ? 'success.main' : 'inherit',
                    opacity: copiedUsername ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copiedUsername ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={(e) => !isLocked && setPassword(e.target.value)}
          placeholder="Password"
          disabled={isLocked}
          InputProps={{
            sx: {
              fontSize: '0.9rem',
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 1, mr: -1 }}>
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ opacity: 0.6 }}
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCopyPassword}
                  sx={{
                    color: copiedPassword ? 'success.main' : 'inherit',
                    opacity: copiedPassword ? 1 : 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {copiedPassword ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="Details"
          value={details}
          onChange={(e) => !isLocked && setDetails(e.target.value)}
          placeholder="Additional details..."
          disabled={isLocked}
          multiline
          rows={2}
          InputProps={{
            sx: {
              fontSize: '0.8rem',
            },
          }}
          sx={{ mb: 1 }}
        />
      </Box>
    </Box>
  );
}

export default LoginkeyItem;
