// eslint-disable-next-line import/prefer-default-export
export const shortAddress = (address: string): string => {
  return address.length < 9
    ? address
    : `${address.substring(0, 5)}...${address.substring(address.length - 5)}`;
};
