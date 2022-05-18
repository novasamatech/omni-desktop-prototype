import React from 'react';
import cn from 'classnames';

interface Props {
  className?: string;
}

const ListItem: React.FC<Props> = ({ className, children }) => {
  return (
    <li className="flex flex-row">
      <div className={cn('flex flex-1 items-center p-4', className)}>
        {children}
      </div>
    </li>
  );
};

export default ListItem;
