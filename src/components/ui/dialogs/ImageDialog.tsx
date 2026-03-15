import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import * as simpleIcons from 'simple-icons';

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (image: string | null) => void;
}

export function ImageDialog({ open, onClose, onSelect }: ImageDialogProps) {
  const [search, setSearch] = useState('');

  const icons = useMemo(() => {
    const allIcons = Object.values(simpleIcons);
    if (!search.trim()) return allIcons.slice(0, 100);
    
    const searchLower = search.toLowerCase();
    return allIcons.filter((icon: { slug: { toLowerCase: () => string; }; title: { toLowerCase: () => string; } }) => 
      icon.slug.toLowerCase().includes(searchLower) ||
      icon.title.toLowerCase().includes(searchLower)
    ).slice(0, 100);
  }, [search]);

  const handleIconClick = (icon: { path: string; hex: string }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}" fill="#${icon.hex}"/></svg>`;
    const base64 = btoa(svg);
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    onSelect(dataUrl);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onSelect(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Image</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <IconButton onClick={handleFileSelect} sx={{ ml: 1 }}>
            <FolderIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          height: 300, 
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
        }}>
          <Grid container spacing={1}>
            {icons.map((icon) => (
              <Grid key={icon.slug} size={3}>
                <Box
                  onClick={() => handleIconClick(icon)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      '& svg': {
                        width: '100%',
                        height: '100%',
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24"><path d="${icon.path}" fill="#${icon.hex}"/></svg>` }}
                  />
                  <Box 
                    component="span" 
                    sx={{ 
                      fontSize: 10, 
                      mt: 0.5, 
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {icon.title}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ImageDialog;
