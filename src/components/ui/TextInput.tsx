import { ReactNode } from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MuiTextField from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material';

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  autoFocus?: boolean;
  value: string;
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  endAdornment?: ReactNode;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

function TextInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required = true,
  autoFocus = false,
  value,
  error = false,
  helperText = '',
  onChange,
  icon,
  endAdornment,
  sx,
  fullWidth = true,
}: TextInputProps) {
  return (
    <FormControl fullWidth={fullWidth}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <MuiTextField
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        fullWidth
        variant="outlined"
        autoFocus={autoFocus}
        value={value}
        error={error}
        helperText={helperText}
        color={error ? 'error' : 'primary'}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: icon,
            endAdornment: endAdornment,
          },
        }}
        sx={sx}
      />
    </FormControl>
  );
}

export default TextInput;
