import React from 'react';
import cn from 'classnames';

type Props = {
  visible: boolean;
  italic?: boolean;
  className?: string;
};

const ErrorMessage: React.FC<Props> = ({
  visible = false,
  italic = true,
  className,
  children,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={cn('text-red-500 text-sm', italic && 'italic', className)}>
      {children}
    </div>
  );
};

export default ErrorMessage;
