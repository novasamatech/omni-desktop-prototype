import success from '../../../assets/success.svg';
import pending from '../../../assets/pending.svg';
import { StatusType } from '../../common/constants';

type Props = {
  status: StatusType;
  className?: string;
};

const Status: React.FC<Props> = ({ status, className }: Props) => {
  if (status === StatusType.SUCCESS) {
    return <img className={className} src={success} alt="success" />;
  }

  return <img className={className} src={pending} alt="pending" />;
};

export default Status;
