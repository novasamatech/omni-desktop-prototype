/* eslint-disable react/require-default-props */
import React, { SelectHTMLAttributes } from 'react';

export type OptionType = {
  value: string;
  label: string;
};

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  inputClassName?: string;
  options: OptionType[];
}

const Select: React.FC<Props> = ({
  id,
  label,
  required,
  placeholder,
  name,
  disabled,
  options,
  value,
  className = '',
  inputClassName = '',
  onChange,
  onBlur,
}) => {
  return (
    <div
      className={`relative border border-gray-500 rounded-lg pt-2 pl-3 pr-3 pb-3 ${
        disabled ? 'bg-gray-200 pointer-events-none' : ''
      } ${className}`}
    >
      {label && (
        <label htmlFor={id} className="text-gray-500 text-sm mb-1">
          {label}{' '}
          {required && <span className="text-red-500 required-dot">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`flex-1 appearance-none w-full mt-1 text-black placeholder-gray-400 text-xl focus:outline-none
          ${disabled ? 'bg-gray-200' : ''}
          ${inputClassName}`}
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
