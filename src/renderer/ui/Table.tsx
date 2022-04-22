// FIXME
/* eslint-disable react/no-array-index-key */

interface Props {
  withBorder?: boolean;
  headers?: string[];
  data?: Array<Array<string>>;
}

const Table = ({ withBorder, headers, data }: Props) => {
  const borderClasses = withBorder ? 'border' : 'border-b-2';

  return (
    <table className="table p-4 bg-white shadow rounded-lg">
      {headers && (
        <thead>
          <tr>
            {headers.map((head) => {
              return (
                <th
                  key={head}
                  className={`${borderClasses} p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900`}
                >
                  {head}
                </th>
              );
            })}
          </tr>
        </thead>
      )}

      <tbody>
        {data?.map((row, index) => {
          return (
            <tr className="text-gray-700" key={index}>
              {row.map((text) => {
                return (
                  <td
                    key={text}
                    className={`${borderClasses} p-4 dark:border-dark-5`}
                  >
                    {text}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

Table.defaultProps = {
  withBorder: false,
  headers: undefined,
  data: [],
};

export default Table;
