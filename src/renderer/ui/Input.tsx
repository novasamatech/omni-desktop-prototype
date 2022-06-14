import React, { InputHTMLAttributes } from 'react';
import Identicon from '@polkadot/react-identicon';
import cn from 'classnames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  address?: boolean;
  invalid?: boolean;
  inputClassName?: string;
}

const InputText: React.FC<InputProps> = ({
  type = 'text',
  label,
  required,
  placeholder,
  name,
  disabled,
  address,
  id,
  className = '',
  inputClassName = '',
  value,
  invalid = false,
  onChange,
  onBlur,
}) => {
  return (
    <div
      className={cn(
        'relative border border-gray-500 rounded-lg pt-2 pl-3 pr-3 pb-3',
        disabled ? 'bg-gray-100 pointer-events-none' : 'bg-white',
        className,
      )}
    >
      {label && (
        <div className="flex justify-between">
          <label htmlFor={id} className="text-gray-500 text-sm mb-2">
            {label}{' '}
            {required && <span className="text-red-500 required-dot">*</span>}
          </label>
          {address && (
            <Identicon theme="polkadot" value={value?.toString()} size={16} />
          )}
        </div>
      )}
      <input
        id={id}
        disabled={disabled}
        className={cn(
          'flex-1 appearance-none w-full mt-1',
          'placeholder-gray-400 text-xl focus:outline-none',
          invalid ? 'text-red-500' : 'text-black',
          disabled ? 'bg-gray-100' : 'bg-white',
          inputClassName,
        )}
        value={value}
        step="any"
        type={type}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
      />
    </div>
  );
};

export default InputText;
