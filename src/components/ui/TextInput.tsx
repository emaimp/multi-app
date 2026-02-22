import { ReactNode } from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MuiTextField from '@mui/material/TextField';

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
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  icon: ReactNode;
  endAdornment?: ReactNode;
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
  onChange,
  error = false,
  helperText = '',
  icon,
  endAdornment,
}: TextInputProps) {
  return (
    <FormControl>
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
        error={error}
        helperText={helperText}
        color={error ? 'error' : 'primary'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: icon,
            endAdornment: endAdornment,
          },
        }}
      />
    </FormControl>
  );
}

export default TextInput;
