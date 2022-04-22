/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ChangeEvent } from 'react';

interface Props {
  label?: string;
  className?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ label, checked, onChange, className = '' }: Props) => {
  return (
    <div className={className}>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="checked-demo"
          checked={checked}
          onChange={onChange}
          className="form-tick appearance-none  bg-white h-5 w-5 border border-gray-300 rounded-md checked:bg-black checked:border-transparent focus:outline-none"
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
