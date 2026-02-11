import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useUser } from '../../context/AuthContext';
import imageCompression from 'browser-image-compression';

export function SettingsView() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);

  const [errors, setErrors] = useState<{
    username?: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    masterKey?: string;
    general?: string;
  }>({});

  const [success, setSuccess] = useState('');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 200,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (username && username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (oldPassword || masterKey || newPassword || confirmPassword) {
      if (!oldPassword) {
        newErrors.oldPassword = 'Old password is required.';
      }
      if (newPassword && newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters.';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!masterKey) {
        newErrors.masterKey = 'Master key is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      if (avatarPreview !== user?.avatar) {
        await updateUser({ avatar: avatarPreview });
      }

      if (username !== user?.username) {
        await updateUser({ username });
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMasterKey('');

      setSuccess('Settings saved successfully.');
    } catch (err) {
      setErrors({ general: 'Failed to save settings.' });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        sx={{
          background: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => theme.shadows[1],
          minHeight: '48px !important',
          height: '48px',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '48px !important',
            height: '48px',
            minWidth: 'auto',
            px: 2,
          }}
        >
          <IconButton color="inherit" onClick={handleBack} sx={{ p: 0.5 }}>
            <ArrowBackIcon sx={{ fontSize: 25, color: (theme) => theme.palette.text.primary }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pt: 8, pb: 5 }}>
        <Box sx={{ maxWidth: 500, width: '100%', px: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
                src={avatarPreview}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Username
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                placeholder="Enter username"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Change Password
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                type="password"
                label="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                error={!!errors.oldPassword}
                helperText={errors.oldPassword}
              />
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />

            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="Master Key"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              error={!!errors.masterKey}
              helperText={errors.masterKey}
            />

            {errors.general && (
              <Typography color="error" sx={{ textAlign: 'center' }}>
                {errors.general}
              </Typography>
            )}

            {success && (
              <Typography color="success" sx={{ textAlign: 'center' }}>
                {success}
              </Typography>
            )}
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SettingsView;
