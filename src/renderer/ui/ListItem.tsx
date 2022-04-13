// FIXME
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

interface Props {
  onClick?: (params: any) => void;
  className?: string;
  children: React.ReactNode;
}

const ListItem: React.FC<Props> = ({ onClick, children, className }: Props) => {
  return (
    <li className="flex flex-row">
      <div
        onClick={onClick}
        className={`${
          onClick && 'cursor-pointer'
        } flex flex-1 items-center p-4 ${className}`}
      >
        {children}
      </div>
    </li>
  );
};

ListItem.defaultProps = {
  onClick: undefined,
  className: '',
};

export default ListItem;
