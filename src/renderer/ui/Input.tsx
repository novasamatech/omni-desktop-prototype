/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import { ChangeEvent } from 'react';
import Identicon from '@polkadot/react-identicon';

interface Props {
  type?: string;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  address?: boolean;
  id?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: any) => void;
  className?: string;
  inputClassName?: string;
}

const InputText = ({
  type = 'text',
  label,
  required,
  error,
  placeholder,
  name,
  disabled,
  address,
  id,
  className = '',
  inputClassName = '',
  value,
  onChange,
  onBlur,
}: Props) => {
  return (
    <div
      className={`relative border border-gray-500 rounded-lg pt-2 pl-3 pr-3 pb-3 ${
        disabled ? 'bg-gray-100 pointer-events-none' : ''
      } ${className}`}
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
        className={`
            flex-1 appearance-none w-full mt-1 text-black placeholder-gray-400 text-xl focus:outline-none
            ${disabled ? 'bg-gray-100' : ''}
            ${inputClassName}
          `}
        value={value}
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
      />

      {error && (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            fill="currentColor"
            className="absolute text-red-500 right-2 bottom-3"
            viewBox="0 0 1792 1792"
          >
            <path d="M1024 1375v-190q0-14-9.5-23.5t-22.5-9.5h-192q-13 0-22.5 9.5t-9.5 23.5v190q0 14 9.5 23.5t22.5 9.5h192q13 0 22.5-9.5t9.5-23.5zm-2-374l18-459q0-12-10-19-13-11-24-11h-220q-11 0-24 11-10 7-10 21l17 457q0 10 10 16.5t24 6.5h185q14 0 23.5-6.5t10.5-16.5zm-14-934l768 1408q35 63-2 126-17 29-46.5 46t-63.5 17h-1536q-34 0-63.5-17t-46.5-46q-37-63-2-126l768-1408q17-31 47-49t65-18 65 18 47 49z" />
          </svg>

          <p className="absolute text-sm text-red-500 -bottom-6">{error}</p>
        </>
      )}
    </div>
  );
};

export default InputText;
