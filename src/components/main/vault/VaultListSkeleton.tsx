import { Box, Skeleton } from '@mui/material';

interface VaultListSkeletonProps {
  count?: number;
}

export function VaultListSkeleton({ count = 4 }: VaultListSkeletonProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            borderRadius: 1,
          }}
        >
          <Skeleton
            variant="circular"
            width={48}
            height={48}
          />

          <Skeleton
            variant="text"
            sx={{
              flexGrow: 1,
              ml: 2,
              width: '40%',
              height: 24,
            }}
          />

          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ ml: 1 }}
          />
        </Box>
      ))}
    </Box>
  );
}

export default VaultListSkeleton;
