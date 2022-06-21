import React, { ButtonHTMLAttributes } from 'react';
import spinner from '../../../assets/spinner.svg';

const SizeClass = {
  sm: 'text-sm py-1 px-4',
  md: 'text-base py-2 px-6',
  lg: 'text-lg py-4 px-8',
};

const LoaderClass = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-6 h-6',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: keyof typeof SizeClass;
}

const Button: React.FC<Props> = ({
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  className,
  size = 'md',
  children,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        bg-black hover:bg-gray-800
        rounded-lg text-white
        text-center text-base shadow-md
        flex justify-center items-center
        ${disabled ? ' opacity-70 cursor-not-allowed' : ''}
        ${SizeClass[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <img
          className={`animate-spin ${LoaderClass[size]}`}
          src={spinner}
          alt=""
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
