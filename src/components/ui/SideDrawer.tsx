import { Drawer, Box } from '@mui/material';

interface SideDrawerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function SideDrawer({
  children,
  header,
  footer,
  width = 270,
}: SideDrawerProps) {
  return (
    <Drawer
      sx={{
        width,
        flexShrink: 0,
        overflowX: 'hidden',
        '& .MuiDrawer-paper': {
          width,
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          overflowX: 'hidden',
        },
      }}
      variant="permanent"
    >
      {header}

      <Box sx={{ flex: 1, overflow: 'auto', overflowX: 'hidden', py: 1 }}>{children}</Box>

      {footer}
    </Drawer>
  );
}

export default SideDrawer;
