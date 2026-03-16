import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

interface FilterHeaderProps {
  onFilterClick?: () => void;
  onSortClick?: () => void;
}

export function FilterHeader({
  onFilterClick,
  onSortClick,
}: FilterHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        gap: 1,
      }}
    >
      {onFilterClick && (
        <Tooltip title="Filter" arrow>
          <IconButton
            onClick={onFilterClick}
            size="medium"
            sx={{
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <FilterListIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      )}
      <TextField
        size="small"
        placeholder="Search..."
        variant="outlined"
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
      />
      {onSortClick && (
        <Tooltip title="Sort alphabetically" arrow>
          <IconButton
            onClick={onSortClick}
            size="medium"
            sx={{
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SortByAlphaIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default FilterHeader;
