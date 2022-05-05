/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

const Card = ({ children, className = '' }: PropsWithChildren<Props>) => {
  return (
    <div className={`p-2 m-2 rounded-lg border border-black ${className}`}>
      {children}
    </div>
  );
};
export default Card;
