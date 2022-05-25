/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import Identicon from '@polkadot/react-identicon';
import { toShortText } from '../utils/strings';

interface Props {
  address: string;
  className?: string;
  full?: boolean;
}

const Address = ({ address, className = '', full = false }: Props) => {
  const theme = 'polkadot';
  const size = 16;

  return (
    <span className={`${className}`}>
      <Identicon
        className="align-middle"
        value={address}
        size={size}
        theme={theme}
      />{' '}
      <span className="text-gray-500 text-sm break-all">
        {full ? address : toShortText(address)}
      </span>
    </span>
  );
};
export default Address;
