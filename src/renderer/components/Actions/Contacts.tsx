import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { db } from '../../db/db';
import Address from '../../ui/Address';
import Button from '../../ui/Button';

type ContactTable = {
  id: string;
  name: string;
  address: string;
  matrixId: string;
};

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

  const columns = [
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
        <Link to={`/edit-contact/${row.id}`}>
          <Button size="sm">Edit</Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-top">
        <h2 className="font-light text-xl p-4">Contacts</h2>

        <Link to="/add-contact" className="p-4">
          <Button>Add contact</Button>
        </Link>
      </div>

      <div className="ml-2 mr-2">
        {contacts && (
          <DataTable
            className="w-full justify-between items-center"
            data={tableData}
            columns={columns}
          />
        )}
      </div>
    </>
  );
};

export default WalletList;
