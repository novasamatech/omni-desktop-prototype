import { renderRoutes, RouteConfig } from 'react-router-config';
import Wallet from '../../renderer/components/Actions/Wallet';
import Balances from '../../renderer/components/Actions/Balances';
import ShowCode from '../../renderer/components/ShowCode';
import ScanCode from '../../renderer/components/ScanCode';
import Contacts from '../../renderer/components/Actions/Contacts';
import NetworkList from '../../renderer/components/Actions/NetworkList';
import Transfer from '../../renderer/components/Actions/Transfer';
import Chat from '../../renderer/components/Actions/Chat';
import ManageContact from '../../renderer/components/Actions/ManageContact';
import WalletList from '../../renderer/components/Actions/WalletList';
import Basket from '../../renderer/components/Basket';
import Login from '../../renderer/components/Login';
import MainLayout from '../../renderer/components/Layout/MainLayout';
import ManageMultisigWallet from '../../renderer/components/Actions/ManageMultisigWallet';
import AddWallet from '../../renderer/components/Actions/AddWallet';
import Notifications from '../../renderer/components/Notifications';
import TransferDetails from '../../renderer/components/Transactions/TransferDetails';
import { Routes } from '../constants';

const ConfigRoutes: Record<'pages' | 'mainLayout', RouteConfig[]> = {
  pages: [
    { path: Routes.LOGIN, component: Login },
    { path: Routes.BASKET, component: Basket },
    { path: Routes.NOTIFICATIONS, component: Notifications },
    { path: Routes.SHOW_CODE, component: ShowCode },
    { path: Routes.SCAN_CODE, component: ScanCode },
    { path: Routes.TRANSFER_DETAILS, component: TransferDetails },
  ],
  mainLayout: [
    { path: Routes.TRANSFER, component: Transfer },
    { path: Routes.WALLETS, component: WalletList },

    { path: Routes.CREATE_WALLET, component: AddWallet },
    { path: Routes.WALLET, component: Wallet },
    { path: Routes.CREATE_MULTISIG_WALLET, component: ManageMultisigWallet },
    { path: Routes.EDIT_MULTISIG_WALLET, component: ManageMultisigWallet },

    { path: Routes.CHAT, component: Chat },
    { path: Routes.NETWORK_LIST, component: NetworkList },
    { path: Routes.BALANCES, component: Balances },
    { path: Routes.CONTACTS, component: Contacts },
    { path: Routes.ADD_CONTACT, component: ManageContact },
    { path: Routes.EDIT_CONTACT, component: ManageContact },
  ],
};

function createRouter(): RouteConfig[] {
  return [
    ...ConfigRoutes.pages,
    {
      path: '/*',
      component: ({ route }: RouteConfig) => renderRoutes(route?.routes),
      routes: [{ component: MainLayout, routes: ConfigRoutes.mainLayout }],
    },
  ];
}

export default createRouter;
