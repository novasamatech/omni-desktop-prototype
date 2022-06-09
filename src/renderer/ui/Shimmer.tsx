import React from 'react';

type Props = {
  width?: string;
  height?: string;
};

const Shimmer: React.FC<Props> = ({ width = 'auto', height = 'auto' }) => {
  return (
    <div
      className="h-full w-full rounded-lg shimmer shimmer-badge"
      style={{ width, height }}
    />
  );
};

export default Shimmer;
