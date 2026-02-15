import { useRef } from 'react';
import { Avatar, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import imageCompression from 'browser-image-compression';

interface AvatarPickerProps {
  value?: string | null;
  onChange: (image: string | null) => void;
  size?: number;
  color?: string;
}

export function AvatarPicker({
  value,
  onChange,
  size = 120,
  color,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (value) {
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      fileInputRef.current?.click();
    }
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

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.25,
          bgcolor: 'primary.main',
          border: color ? `4px solid ${color}` : 'none',
          overflow: 'hidden',
        }}
        src={value || undefined}
      >
        {!value && '?'}
      </Avatar>
      <IconButton
        onClick={handleClick}
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
  );
}

export default AvatarPicker;
