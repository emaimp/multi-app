import { useState } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { LoginKey } from '../../types/loginkey';
import { ConfirmDialog } from '../ui';

interface LoginkeyItemProps {
  loginkey: LoginKey;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  onUpdate: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string) => void;
  onDelete: (loginKeyId: string) => void;
}

export function LoginkeyItem({ loginkey, dragAttributes, dragListeners, onUpdate, onDelete }: LoginkeyItemProps) {
  const [isEditingSiteName, setIsEditingSiteName] = useState(false);
  const [siteName, setSiteName] = useState(loginkey.site_name);
  const [url, setUrl] = useState(loginkey.url || '');
  const [username, setUsername] = useState(loginkey.username);
  const [password, setPassword] = useState(loginkey.password);
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(e.target.value);
  };

  const handleSiteNameBlur = () => {
    setIsEditingSiteName(false);
    if (siteName !== loginkey.site_name) {
      onUpdate(loginkey.id, siteName, url || null, username, password);
    }
  };

  const handleSiteNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSiteNameBlur();
    }
  };

  const handleSave = () => {
    onUpdate(loginkey.id, siteName, url || null, username, password);
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
            bgcolor: '#2563eb' + '20',
            borderBottom: '2px solid',
            borderColor: '#2563eb',
          }}
        >
          {isEditingSiteName ? (
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
                cursor: 'pointer',
                px: 0.5,
                borderRadius: 0.5,
              }}
              onClick={() => setIsEditingSiteName(true)}
            >
              {loginkey.site_name || 'Untitled Login Key'}
            </Typography>
          )}

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

          <TextField
            fullWidth
            variant="standard"
            type={showUsername ? 'text' : 'password'}
            label="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username / Email"
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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
