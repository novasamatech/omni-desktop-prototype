import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import DialogContent from '../../ui/DialogContent';
import Button from '../../ui/Button';
import ScanCode from '../ScanCode';
import ShowCode from '../ShowCode';

type Steps = 'wallet' | 'scan' | 'show';

type Props = {
  sign: string;
  visible: boolean;
  onSigned: (signature: string) => void;
  onCancel: () => void;
};

const SignRoom: React.FC<Props> = ({ sign, visible, onSigned, onCancel }) => {
  const [roomState, setRoomState] = useState<Steps>('wallet');

  const handleSign = () => {
    console.log(sign);
    onSigned('123');
  };

  if (!visible) {
    return null;
  }

  return (
    <Dialog
      as="div"
      className="relative z-10"
      open={visible}
      onClose={onCancel}
    >
      <DialogContent>
        <Dialog.Title as="h3" className="font-light text-xl">
          Room creation
        </Dialog.Title>

        {roomState === 'wallet' && (
          <>
            <div className="mt-2">Sign room with one of your wallets?</div>
            {/* Select */}
            <button onClick={handleSign}>test</button>
            <div className=" mt-2 flex justify-between">
              <Button className="max-w-min" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                className="max-w-min"
                onClick={() => setRoomState('scan')}
              >
                Sign
              </Button>
            </div>
          </>
        )}
        {roomState === 'scan' && <ScanCode />}
        {roomState === 'show' && <ShowCode />}
      </DialogContent>
    </Dialog>
  );
};

export default SignRoom;
