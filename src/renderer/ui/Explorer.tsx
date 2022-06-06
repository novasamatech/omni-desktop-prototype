/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */

import cs from 'classnames';
import { Chain } from '../db/types';

type ExplorerTypes = 'account' | 'extrinsic' | 'event';

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
    if (explorer[type]) {
      links.push({
        name: explorer.name,
        link: explorer[type]?.replace(Replacer[type], param) || '',
      });
    }
  });

  return (
    <div className={cs('flex', className)}>
      {links.map((link) => (
        <a href={link.link} rel="noreferrer" target="_blank">
          {link.name}
        </a>
      ))}
    </div>
  );
};
export default Explorer;
