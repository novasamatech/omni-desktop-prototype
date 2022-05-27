import React from 'react';
import right from '../../../../assets/right.svg';
import Status from '../../ui/Status';
import { StatusType } from '../../../common/constants';

type Props = {
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  onClick: () => void;
};

const NotifyItem: React.FC<Props> = ({
  title,
  description,
  date,
  isRead,
  onClick,
}) => {
  return (
    <li className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between">
        <span className="text-gray-500 text-sm">{date}</span>
        <button
          className="flex items-center gap-2"
          type="button"
          onClick={onClick}
        >
          <span className="text-sm">Details</span>
          <img src={right} alt="" />
        </button>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-medium">{title}</div>
        <div className="text-gray-500 mt-1">{description}</div>
      </div>
      <Status
        className="ml-auto"
        status={isRead ? StatusType.SUCCESS : StatusType.WAITING}
        alt={isRead ? 'is read' : 'is not read'}
      />
    </li>
  );
};

export default NotifyItem;
