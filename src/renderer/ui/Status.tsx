import React from 'react';
import success from '../../../assets/success.svg';
import pending from '../../../assets/pending.svg';
import { StatusType } from '../../common/constants';

type Props = {
  status: StatusType;
  alt: string;
  className?: string;
};

const Status: React.FC<Props> = ({ status, alt, className }) => {
  if (status === StatusType.SUCCESS) {
    return <img className={className} src={success} alt={alt} />;
  }

  return <img className={className} src={pending} alt={alt} />;
};

export default Status;
