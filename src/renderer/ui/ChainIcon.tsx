/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import Polkadot from '../../../assets/utils/icons/chains/Polkadot.svg';

interface Props {
  className?: string;
}

const ChainIcon = ({ className = '' }: Props) => {
  return (
    <img
      className={`w-6 mr-2 invert ${className}`}
      src={Polkadot}
      alt="Polkadot"
    />
  );
};
export default ChainIcon;
