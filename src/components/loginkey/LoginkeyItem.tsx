import { useState } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment, Link } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { openUrl } from '@tauri-apps/plugin-opener';
import { LoginKey } from '../../types/loginkey';
import { ConfirmDialog } from '../ui';
import { LOGINKEY_COLORS_HEX } from '../../types/loginkey';

interface LoginkeyItemProps {
  loginkey: LoginKey;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  onUpdate: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDelete: (loginKeyId: string) => void;
}

export function LoginkeyItem({ loginkey, dragAttributes, dragListeners, onUpdate, onDelete }: LoginkeyItemProps) {
  const [isEditingSiteName, setIsEditingSiteName] = useState(false);
  const [siteName, setSiteName] = useState(loginkey.site_name);
  const [url, setUrl] = useState(loginkey.url || '');
  const [username, setUsername] = useState(loginkey.username);
  const [password, setPassword] = useState(loginkey.password);
  const [details, setDetails] = useState(loginkey.details || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const colorHex = LOGINKEY_COLORS_HEX[loginkey.color] || LOGINKEY_COLORS_HEX.blue;

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(e.target.value);
  };

  const handleSiteNameBlur = () => {
    setIsEditingSiteName(false);
    if (siteName !== loginkey.site_name || url !== (loginkey.url || '') || username !== loginkey.username || password !== loginkey.password || details !== (loginkey.details || '')) {
      onUpdate(loginkey.id, siteName, url || null, username, password, details || null);
    }
  };

  const handleSiteNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSiteNameBlur();
    }
  };

  const handleSave = () => {
    onUpdate(loginkey.id, siteName, url || null, username, password, details || null);
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

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(loginkey.id);
    setConfirmOpen(false);
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
    <>
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
          {isEditingSiteName && !isLocked ? (
            <TextField
              autoFocus
              size="small"
              value={siteName}
              onChange={handleSiteNameChange}
              onBlur={handleSiteNameBlur}
              onKeyDown={handleSiteNameKeyDown}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '0.9rem',
                  fontWeight: 500,
                },
              }}
              sx={{
                flexGrow: 1,
              }}
            />
          ) : (
            <Typography
              variant="subtitle2"
              sx={{
                flexGrow: 1,
                fontWeight: 500,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.7 : 1,
                '&:hover': !isLocked ? {
                  bgcolor: 'rgba(255,255,255,0.1)',
                } : {},
                px: 0.5,
                borderRadius: 0.5,
              }}
              onClick={() => !isLocked && setIsEditingSiteName(true)}
            >
              {loginkey.site_name || 'Untitled Login Key'}
            </Typography>
          )}

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

          <IconButton size="small" onClick={handleDeleteClick} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>

          {dragListeners && (
            <DragIndicatorIcon
              sx={{
                color: 'action.active',
                cursor: 'grab',
                ml: 1,
              }}
              {...dragAttributes}
              {...dragListeners}
            />
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          {isLocked ? (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">URL</Typography>
              <Link
                component="button"
                onClick={handleUrlClick}
                sx={{
                  display: 'block',
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: url ? 'pointer' : 'default',
                  opacity: url ? 1 : 0.5,
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
              variant="standard"
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '0.9rem',
                  mb: 1,
                },
              }}
              sx={{ mb: 1 }}
            />
          )}

          <TextField
            fullWidth
            variant="standard"
            type={showUsername ? 'text' : 'password'}
            label="Username / Email"
            value={username}
            onChange={(e) => !isLocked && setUsername(e.target.value)}
            placeholder="Username / Email"
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
                mb: 1,
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
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            variant="standard"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => !isLocked && setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
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
          />

          <TextField
            fullWidth
            variant="standard"
            label="Details"
            value={details}
            onChange={(e) => !isLocked && setDetails(e.target.value)}
            placeholder="Additional details..."
            disabled={isLocked}
            multiline
            rows={2}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
                mt: 1,
              },
            }}
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Login Key"
        message={`Are you sure you want to delete "${loginkey.site_name || 'Untitled Login Key'}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default LoginkeyItem;
