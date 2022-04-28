/* eslint-disable react/require-default-props */
import React, { useEffect, useState } from 'react';

type Props = {
  disabled?: boolean;
  submit?: boolean;
  fat?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  size?: keyof typeof SizeClass;
};

const SizeClass = {
  sm: 'text-sm py-1 px-4',
  md: 'text-base py-2 px-6',
  lg: 'text-lg py-4 px-8',
};

const Button = ({
  disabled = false,
  submit = false,
  fat = false,
  onClick,
  children,
  className = '',
  size = 'md',
}: Props) => {
  // TODO: Remove this hack when we remove fat property size
  const [sizeClass, setSizeClass] = useState(SizeClass.md);

  useEffect(() => {
    if (size) {
      setSizeClass(SizeClass[size]);
    }

    if (fat) {
      setSizeClass(SizeClass.lg);
    }
  }, [fat, size]);

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
        ${sizeClass}
        ${className}
      `}
    >
      {children && children}
    </button>
  );
};
export default Button;
