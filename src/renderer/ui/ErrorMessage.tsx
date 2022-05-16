/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { PropsWithChildren } from 'react';

interface Props {
  show: boolean;
  className?: string;
}

const ErrorMessage = ({
  children,
  show = false,
  className,
}: PropsWithChildren<Props>) => {
  return show ? (
    <div className={`text-red-500 text-sm italic ${className}`}>{children}</div>
  ) : null;
};
export default ErrorMessage;
