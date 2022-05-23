// eslint-disable-next-line import/prefer-default-export
export const toShortText = (text = ''): string => {
  return text.length < 13 ? text : `${text.slice(0, 6)}...${text.slice(-6)}`;
};
