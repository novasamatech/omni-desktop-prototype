/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ChangeEvent } from 'react';

interface Props {
  label?: string;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({
  label,
  checked,
  disabled,
  onChange,
  className = '',
}: Props) => {
  return (
    <div className={className}>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="checked"
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          className={`
          appearance-none bg-white h-5 w-5
          border border-gray-300 rounded-md
          checked:bg-black checked:border-transparent focus:outline-none
          ${disabled ? 'bg-gray-100' : ''}
        `}
        />
        {label && (
          <span className="text-gray-700 dark:text-white font-normal">
            {label}
          </span>
        )}
      </label>
    </div>
  );
};
export default Checkbox;
