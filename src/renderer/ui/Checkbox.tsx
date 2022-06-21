/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<Props> = ({
  label,
  checked,
  disabled,
  className,
  onChange,
}) => {
  return (
    <div className={`hover:cursor-pointer ${className}`}>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="checked"
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          className={`
            appearance-none h-5 w-5
            border border-gray-300 rounded-md
            checked:bg-black checked:border-transparent focus:outline-none
            ${disabled ? 'bg-gray-100' : ''}
          `}
        />
        {label && (
          <span className="ml-2 text-gray-700 font-normal">{label}</span>
        )}
      </label>
    </div>
  );
};
export default Checkbox;
