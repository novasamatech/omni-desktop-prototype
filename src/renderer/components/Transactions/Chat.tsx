import React from 'react';
import { useMatrix } from '../Providers/MatrixProvider';
import { Routes } from '../../../common/constants';
import LinkButton from '../../ui/LinkButton';
import arrowUp from '../../../../assets/arrow-up.svg';
import { HexString } from '../../../common/types';
import { MstParams } from '../../modules/types';

type Props = {
  callData: HexString;
};

const Chat: React.FC<Props> = ({ callData }) => {
  const { matrix, notifications } = useMatrix();

  const txNotif = notifications.filter(
    (notif) => (notif.content as MstParams).callData === callData,
  );
  console.log(txNotif);

  if (!matrix.isLoggedIn) {
    return (
      <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
        <h2 className="text-2xl font-normal mb-6">Chat</h2>
        <div className="flex flex-col items-center justify-center h-full -mt-14">
          <p className="mb-4">You are not logged in to Matrix</p>
          <LinkButton className="w-max" to={Routes.LOGIN}>
            Login
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 w-[350px] bg-gray-100 px-4 py-3 rounded-2xl">
      <h2 className="text-2xl font-normal mb-6">Chat</h2>

      <div className="flex flex-col h-[calc(100%-56px)] justify-between gap-3">
        <ul className="flex flex-col max-h-[412px] overflow-y-auto gap-3 pb-2">
          {txNotif.map((_) => (
            <li className="w-max max-w-[318px] rounded-lg shadow-md bg-white p-2">
              <span className="text-sm">
                ✅ Validator 1 approved transaction
              </span>
              <span className="float-right ml-1 text-gray-400 text-xs leading-[25px]">
                18:16
              </span>
            </li>
          ))}
          {/* <li className="w-max max-w-[318px] rounded-lg shadow-md bg-white p-2"> */}
          {/*   <span className="text-sm">✅ Validator 1 approved transaction</span> */}
          {/*   <span className="float-right ml-1 text-gray-400 text-xs leading-[25px]"> */}
          {/*       18:16 */}
          {/*     </span> */}
          {/* </li> */}
        </ul>

        <div className="relative">
          <div className="cursor-default bg-gray-200 border-2 border-gray-300 rounded-3xl p-2 text-sm text-gray-400">
            Write a message...
          </div>
          <img
            className="absolute right-1 top-1 p-1 bg-gray-400 rounded-full"
            src={arrowUp}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
