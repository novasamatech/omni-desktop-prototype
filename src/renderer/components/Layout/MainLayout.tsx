import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { renderRoutes, RouteConfig } from 'react-router-config';
import { db, TransactionStatus } from '../../db/db';
import FirstColumn from '../FirstColumn';
import SecondColumn from '../SecondColumn';
import LinkButton from '../../ui/LinkButton';
import { Routes } from '../../../common/constants';

type Props = {
  route?: RouteConfig;
};

const MainLayout: React.FC<Props> = ({ route }) => {
  // TODO: Connect to the chain on app start

  // const [connections, setConnections] = useRecoilState(connectionState);
  // const [inited, setInited] = useState(false);

  const transactions = useLiveQuery(() =>
    db.transactions
      .where('status')
      .notEqual(TransactionStatus.CONFIRMED)
      .toArray(),
  );
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
      <div className={`flex h-screen ${transactions?.length && 'pb-20'}`}>
        <FirstColumn />
        <SecondColumn />
        <div className="flex-1 overflow-auto">
          {renderRoutes(route?.routes)}
        </div>
      </div>

      {transactions?.length && (
        <div className="flex justify-center items-center fixed bottom-0 w-screen h-20 bg-gray-100">
          <div className="mr-12 w-36">
            View your {transactions.length} pending{' '}
            {transactions.length > 1 ? 'operations' : 'operation'}
          </div>
          <LinkButton to={Routes.BASKET} size="lg">
            View {transactions.length > 1 ? 'operations' : 'operation'}
          </LinkButton>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
