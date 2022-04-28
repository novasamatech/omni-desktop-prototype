import { Dialog } from '@headlessui/react';

type Props = {
  children?: React.ReactNode;
};

const DialogContent = ({ children }: Props) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </>
  );
};

DialogContent.defaultProps = {
  children: null,
};

export default DialogContent;
