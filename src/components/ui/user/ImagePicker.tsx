import { useRef, useState } from 'react';
import { Avatar, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import imageCompression from 'browser-image-compression';
import { ImageDialog } from '../dialogs';

interface ImagePickerProps {
  value?: string | null;
  onChange: (image: string | null) => void;
  size?: number;
  label?: string;
  showUserIcon?: boolean;
}

export function ImagePicker({
  value,
  onChange,
  size = 120,
  label,
  showUserIcon = false,
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSelectFromDialog = (image: string | null) => {
    onChange(image);
    setDialogOpen(false);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const options = {
        maxSizeMB: 0.015,
        maxWidthOrHeight: 250,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const iconButtonSize = size < 100 ? 28 : 32;
  const iconSize = size < 100 ? 16 : 18;
  const isSvgIcon = value?.startsWith('data:image/svg+xml');
  const imageSize = isSvgIcon ? '75%' : '100%';

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.25,
            color: 'text.primary',
            bgcolor: 'action.hover',
            border: '2px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            '& img': {
              objectFit: 'contain',
              width: imageSize,
              height: imageSize,
            },
          }}
          src={value || undefined}
        >
          {!value && (showUserIcon ? <PersonIcon sx={{ fontSize: size * 0.5 }} /> : label)}
        </Avatar>
        <IconButton
          onClick={value ? handleDelete : handleOpenDialog}
          sx={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            width: iconButtonSize,
            height: iconButtonSize,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {value ? (
            <DeleteIcon sx={{ fontSize: iconSize }} />
          ) : (
            <PhotoCameraIcon sx={{ fontSize: iconSize }} />
          )}
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleChange}
        />
      </Box>

      <ImageDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSelect={handleSelectFromDialog}
      />
    </>
  );
}

export default ImagePicker;
