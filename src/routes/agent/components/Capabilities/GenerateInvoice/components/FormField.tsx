import { Input } from '@ui/form/Input';

interface FormFieldProps {
  name: string;
  label: string;
  value: string;
  optional?: boolean;
  error: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  children?: (props: {
    id: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
  }) => React.ReactNode;
}

export const FormField = ({
  name,
  label,
  value,
  error,
  optional,
  onChange,
  children,
  placeholder,
}: FormFieldProps) => {
  return (
    <div className='flex flex-col gap-0.5'>
      <label htmlFor={name} className='text-sm font-medium'>
        {label}
        {optional && (
          <span className='text-grayModern-500 ml-0.5 font-normal'>
            (optional)
          </span>
        )}
      </label>
      {children ? (
        children({ id: name, value, onChange, placeholder })
      ) : (
        <Input
          size='sm'
          id={name}
          value={value}
          variant='outline'
          placeholder={placeholder}
          className='bg-transparent max-w-[320px]'
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <span className='text-xs text-error-500'>{error}</span>}
    </div>
  );
};
