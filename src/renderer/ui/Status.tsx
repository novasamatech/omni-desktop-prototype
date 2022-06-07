import React from 'react';
import success from '../../../assets/success.svg';
import waiting from '../../../assets/waiting.svg';
import abstained from '../../../assets/abstained.svg';
import { StatusType } from '../../common/constants';

const IMG: Record<StatusType, string | undefined> = {
  success,
  waiting,
  abstained,
};

type Props = {
  status: StatusType;
  alt: string;
  className?: string;
};

const Status: React.FC<Props> = ({ status, alt, className }) => {
  return <img className={className} src={IMG[status]} alt={alt} />;
};

export default Status;
