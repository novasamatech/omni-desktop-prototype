/* eslint-disable react/require-default-props */
import React from 'react';

type Props = {
  disabled?: boolean;
  submit?: boolean;
  fat?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
};

const Button: React.FC<Props> = ({
  disabled = false,
  submit = false,
  fat = false,
  onClick,
  children,
  className = '',
}: Props) => {
  return (
    <button
      onClick={onClick}
      type={submit ? 'submit' : 'button'}
      disabled={disabled}
      className={`
        bg-black hover:bg-gray-800
        rounded-lg text-white w-full
        text-center text-base shadow-md
        flex justify-center items-center
        ${disabled ? ' opacity-70 cursor-not-allowed' : ''}
        ${fat ? 'py-4 px-6 ' : 'py-2 px-4 '}
        ${className}
      `}
    >
      {children && children}
    </button>
  );
};
export default Button;
