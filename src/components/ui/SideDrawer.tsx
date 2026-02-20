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
  width = 240,
}: SideDrawerProps) {
  return (
    <Drawer
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
        },
      }}
      variant="permanent"
    >
      {header}

      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>{children}</Box>

      {footer}
    </Drawer>
  );
}

export default SideDrawer;
