import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { renderRoutes, RouteConfig } from 'react-router-config';
import cn from 'classnames';
import { db } from '../../db/db';
import { TransactionStatus } from '../../db/types';
import FirstColumn from '../FirstColumn';
import SecondColumn from '../SecondColumn';
import LinkButton from '../../ui/LinkButton';
import { Routes } from '../../../common/constants';
import { useMatrix } from '../Providers/MatrixProvider';

type Props = {
  route?: RouteConfig;
};

const MainLayout: React.FC<Props> = ({ route }) => {
  const { matrix, notifications } = useMatrix();

  const hasUnreadNotifs = notifications.some((n) => !n.isRead);

  // TODO: Connect to the chain on app start

  // const [connections, setConnections] = useRecoilState(connectionState);
  // const [inited, setInited] = useState(false);

  const transactions = useLiveQuery(() =>
    db.transactions
      .where('status')
      .notEqual(TransactionStatus.CONFIRMED)
      .toArray(),
  );

  const isTransactionsExist = transactions && transactions.length > 0;

  // const activeNetworks = useLiveQuery(() => {
  //   return db.chains
  //     .where('activeType')
  //     .anyOf(ActiveType.LOCAL_NODE, ActiveType.EXTERNAL_NODE)
  //     .toArray();
  // });

  // useEffect(() => {
  //   if (inited) {
  //     return;
  //   }

  //   activeNetworks?.forEach(async (n) => {
  //     let provider: ProviderInterface | undefined;

  //     if (n.activeType === ActiveType.LOCAL_NODE) {
  //       const scClient = createPolkadotJsScClient();

  //       const chainId = getKnownChainId(n.name);

  //       if (chainId) {
  //         provider = await scClient.addWellKnownChain(chainId);
  //       } else {
  //         const chainSpec = getChainSpec(n.chainId);
  //         if (chainSpec) {
  //           provider = await scClient.addChain(chainSpec);
  //         }
  //       }
  //     } else if (n.activeType === ActiveType.EXTERNAL_NODE) {
  //       provider = new WsProvider(n.nodes[0].url);
  //     }

  //     if (provider) {
  //       ApiPromise.create({ provider })
  //         .then((api) =>
  //           setConnections((prev) => ({
  //             ...prev,
  //             [n.chainId]: { network: n, api, provider },
  //           }))
  //         )
  //         .catch((e) => console.error(e));
  //     }
  //   });

  //   setInited(true);
  // }, [activeNetworks, connections, setConnections, inited]);

  return (
    <div className="flex h-screen">
      <FirstColumn />
      <SecondColumn />
      <div
        className={cn('flex-1 overflow-auto', isTransactionsExist && 'pb-20')}
      >
        {renderRoutes(route?.routes)}
      </div>

      <div className="flex fixed bottom-0 w-screen bg-gray-100 p-3">
        {isTransactionsExist && (
          // FIXME: operationS
          <LinkButton className="mr-auto" to={Routes.BASKET} size="md">
            5 pending operations
          </LinkButton>
        )}
        {matrix.isLoggedIn && (
          <LinkButton
            className={cn('ml-auto', hasUnreadNotifs && 'bg-red-400')}
            to={Routes.NOTIFICATIONS}
            size="md"
          >
            Notifications
          </LinkButton>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
