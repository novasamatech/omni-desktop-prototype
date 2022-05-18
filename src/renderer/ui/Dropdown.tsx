/* eslint-disable react/require-default-props */
import React, { SelectHTMLAttributes } from 'react';

export type OptionType = {
  value: string;
  label: string;
};

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: OptionType[];
}

const Dropdown: React.FC<Props> = ({
  id,
  placeholder,
  name,
  disabled,
  options,
  value,
  className = '',
  onChange,
}) => {
  return (
    <select
      id={id}
      className={`
        bg-black hover:bg-gray-800
        rounded-lg text-white w-full
        text-center text-base shadow-md
        flex justify-center items-center py-2 px-4
        ${disabled ? ' opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      name={name}
      placeholder={placeholder}
      defaultValue={value}
      disabled={disabled}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
