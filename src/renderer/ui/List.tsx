import React from 'react';

const List: React.FC = ({ children }) => {
  return (
    <div className="container flex flex-col mx-auto w-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <ul className="flex flex-col divide divide-y w-full">{children}</ul>
    </div>
  );
};

export default List;
