import * as React from 'react';
import { apply, tw, tx } from '@twind/core';
import { IconType } from '@akashaorg/typings/ui';

import Box from '../Box';
import Icon from '../Icon';
import Text from '../Text';

export type DropdownMenuItemType = { id: string; iconName?: IconType; title: string };

export interface IDropdownProps {
  name?: string;
  label?: string;
  placeholderLabel?: string;
  selected: DropdownMenuItemType;
  menuItems: DropdownMenuItemType[];
  setSelected: React.Dispatch<React.SetStateAction<DropdownMenuItemType>>;
}

const Dropdown: React.FC<IDropdownProps> = ({
  label,
  placeholderLabel,
  menuItems,
  selected,
  setSelected,
}) => {
  const [dropOpen, setDropOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (placeholderLabel) {
      setSelected({
        id: '',
        iconName: null,
        title: placeholderLabel ?? menuItems[0].title,
      });
    } else {
      setSelected(menuItems[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optionsWrapperStyle = apply`absolute w-full z-10 max-h-60 mt-1 py-0 rounded-lg overflow-auto bg-(white dark:grey5) border(1 grey8 dark:grey3)`;

  const optionStyle = apply`flex items-center justify-between p-3 bg-(hover:grey8 dark:hover:grey5)`;

  const handleDropClick = () => {
    setDropOpen(!dropOpen);
  };

  const handleChange = (menuItem: DropdownMenuItemType) => () => {
    setSelected(menuItem);
    setDropOpen(!dropOpen);
  };

  return (
    <Box customStyle="relative min-w-[8rem]">
      {label && (
        <Text variant="label" color={{ light: 'black', dark: 'white' }}>
          {label}
        </Text>
      )}

      <button
        className={tx`inline-flex items-center justify-between min-w-[8rem] p-3 rounded-lg bg-(white dark:grey5) rounded-lg border-(1 solid ${
          dropOpen ? 'secondaryLight dark:secondark-dark' : 'grey8 dark:grey3'
        })`}
        onClick={handleDropClick}
      >
        <Text variant="body1" color={{ light: 'black', dark: 'white' }}>
          {selected?.title}
        </Text>
        {dropOpen ? (
          <Icon type="ChevronUpIcon" customStyle="ml-4" />
        ) : (
          <Icon type="ChevronDownIcon" customStyle="ml-4" />
        )}
      </button>

      {/* <!-- Dropdown menu --> */}
      {dropOpen && (
        <Box customStyle={optionsWrapperStyle}>
          <ul aria-labelledby="dropdownDefaultButton">
            {menuItems.map((menuItem, idx) => {
              const isSelected = selected?.id === menuItem.id;
              return (
                <li
                  key={menuItem.id}
                  className={tw(
                    `${optionStyle} ${
                      idx < menuItems.length - 1 ? 'border-b(1 grey8 dark:grey3)' : ''
                    } cursor-pointer`,
                  )}
                  onClick={handleChange(menuItem)}
                >
                  <Box
                    customStyle={`flex items-center space-x-2 ${
                      isSelected ? 'text-secondaryLight' : 'text-black'
                    }`}
                  >
                    {menuItem?.iconName && (
                      <Icon
                        type={menuItem.iconName}
                        color={
                          isSelected
                            ? { light: 'secondaryLight', dark: 'secondaryDark' }
                            : { light: 'black', dark: 'white' }
                        }
                      />
                    )}
                    <Text
                      variant="body1"
                      color={
                        isSelected
                          ? { light: 'secondaryLight', dark: 'secondaryDark' }
                          : { light: 'black', dark: 'white' }
                      }
                    >
                      {menuItem.title}
                    </Text>
                  </Box>
                  {isSelected && (
                    <span className={tw('ml-4')}>
                      <Icon
                        type="CheckIcon"
                        color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default Dropdown;
