/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: Props) => {
  return (
    <div className={`p-2 m-2 rounded-lg border border-black ${className}`}>
      {children}
    </div>
  );
};
export default Card;
