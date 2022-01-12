import React from 'react';

type Props = {
  transaction: any;
};

const Transaction: React.FC<Props> = ({ transaction }: Props) => {
  return (
    <div>
      <div>{transaction.type}</div>
      <div>{transaction.payload.address}</div>
      <div>{transaction.payload.amount}</div>
    </div>
  );
};

export default Transaction;
