/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */

import cn from 'classnames';
import { Chain } from '../db/types';
import subscan from '../../../assets/explorers/subscan.png';
import statescan from '../../../assets/explorers/statescan.svg';
import polkascan from '../../../assets/explorers/polkascan.png';
import subid from '../../../assets/explorers/subid.svg';

type ExplorerTypes = 'account' | 'extrinsic' | 'event';

const Icons: Record<string, string> = {
  Statescan: statescan,
  Subscan: subscan,
  Polkascan: polkascan,
  'Sub.ID': subid,
};

interface Props {
  param: string;
  type: ExplorerTypes;
  network: Chain;
  className?: string;
}

const Replacer = {
  account: '{address}',
  extrinsic: '{hash}',
  event: '{event}',
};

const Explorer = ({ param, type, network, className = '' }: Props) => {
  const links: { name: string; link: string }[] = [];

  network.explorers?.forEach((explorer) => {
    if (explorer[type] && Icons[explorer.name]) {
      links.push({
        name: explorer.name,
        link: explorer[type]?.replace(Replacer[type], param) || '',
      });
    }
  });

  return (
    <div className={cn('flex gap-1 items-center', className)}>
      {links.map((link) => (
        <a href={link.link} key={link.link} rel="noreferrer" target="_blank">
          <img className="w-5 h-5" src={Icons[link.name]} alt={link.name} />
        </a>
      ))}
    </div>
  );
};
export default Explorer;
