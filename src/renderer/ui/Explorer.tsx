import React from 'react';
import cn from 'classnames';
import { Chain } from '../db/types';
import subscan from '../../../assets/explorers/subscan.svg';
import statescan from '../../../assets/explorers/statescan.svg';
import polkascan from '../../../assets/explorers/polkascan.svg';
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

const Explorer: React.FC<Props> = ({
  param,
  type,
  network,
  className = '',
}) => {
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
        <a key={link.link} href={link.link} rel="noreferrer" target="_blank">
          <img className="w-5 h-5" src={Icons[link.name]} alt={link.name} />
        </a>
      ))}
    </div>
  );
};
export default Explorer;
