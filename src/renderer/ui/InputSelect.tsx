/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState } from 'react';
import { OptionType } from './Select';
import Address from './Address';
import InputText, { InputProps } from './Input';
import useOutsideClick from '../hooks/outsideClick';

interface Props extends InputProps {
  options: OptionType[];
  onOptionSelect: (address: string) => void;
}

const InputSelect: React.FC<Props> = ({
  options,
  onChange,
  onOptionSelect,
  ...props
}) => {
  const inputRef = useRef<HTMLDivElement>(null);

  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useOutsideClick(inputRef, () => setIsSelectOpen(false));

  const onSelect = (value: string) => () => {
    onOptionSelect(value);
    setIsSelectOpen(false);
  };

  return (
    <div className="relative" ref={inputRef}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={() => setIsSelectOpen(true)}>
        <InputText {...props} onChange={onChange} />
      </div>

      {isSelectOpen && (
        <ul className="max-h-[195px] flex flex-col gap-2 overflow-x-hidden overscroll-contain p-3 border border-gray-500 rounded-lg absolute top-[84px] z-10 bg-white shadow-md">
          {options.map((option) => (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events
            <li
              key={option.value}
              className="cursor-pointer border-b border-b-gray-300 pb-2"
              onClick={onSelect(option.value)}
            >
              <div>{option.label}</div>
              <Address address={option.value} full />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InputSelect;
