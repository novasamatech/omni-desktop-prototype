import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import DataTable from 'react-data-table-component';
import { db } from '../../db/db';
import Address from '../../ui/Address';
import LinkButton from '../../ui/LinkButton';

type ContactTable = {
  id: string;
  name: string;
  address: string;
  matrixId: string;
};

const COLUMNS = [
  {
    name: 'Name',
    selector: (row: ContactTable) => row.name,
  },
  {
    name: 'Matrix ID',
    selector: (row: ContactTable) => row.matrixId,
  },
  {
    name: 'Address',
    cell: (row: ContactTable) => <Address address={row.address} />,
  },
  {
    button: true,
    right: true,
    cell: (row: ContactTable) => (
      <LinkButton to={`/edit-contact/${row.id}`} size="sm">
        Edit
      </LinkButton>
    ),
  },
];

const WalletList: React.FC = () => {
  const contacts = useLiveQuery(() => db.contacts.toArray());
  const [tableData, setTableData] = useState<ContactTable[]>([]);

  useEffect(() => {
    const data = contacts?.map(
      (c) =>
        ({
          id: c.id?.toString(),
          name: c.name,
          address: c.mainAccounts[0].accountId,
          matrixId: c.secureProtocolId,
        } as ContactTable)
    );
    if (data) {
      setTableData(data);
    }
  }, [contacts]);

  return (
    <>
      <div className="flex justify-between items-top">
        <h2 className="font-light text-xl m-4">Contacts</h2>

        <LinkButton to="/add-contact" className="m-4" size="lg">
          Add contact
        </LinkButton>
      </div>

      <div className="ml-2 mr-2">
        {contacts && (
          <DataTable
            className="w-full justify-between items-center"
            data={tableData}
            columns={COLUMNS}
          />
        )}
      </div>
    </>
  );
};

export default WalletList;
