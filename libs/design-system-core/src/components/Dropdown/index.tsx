import * as React from 'react';
import { apply, tw, tx } from '@twind/core';
import Card from '../Card';
import Icon from '../Icon';
import Label from '../Label';
import Link from '../Link';
import Stack from '../Stack';
import Text from '../Text';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../Icon/hero-icons-outline';
import { useCloseActions } from '../../utils';

export type DropdownProps = {
  name?: string;
  label?: string;
  placeholderLabel?: string;
  selected?: string;
  menuItems: string[];
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  required?: boolean;
};

/**
 * A Dropdown component provides a fast and easy way to include a dropdown in your app.
 * When inactive, the dropdown display a placeholder text or a single value. Upon activation,
 * a list of options is presented to the user so that they can select.
 * @param name - (optional) dropdown's name
 * @param label - (optional) dropdown's label
 * @param placeholderLabel - (optional) a placeholder text to be displayed by default
 * @param selected - (optional) selected item by default
 * @param menuItems - a list of menu items to be displayed on activation
 * @param setSelected - handler function to set the selected item
 * is used in a form, and it is a required field
 * ```tsx
 *  <Dropdown
 *    name='dropdown'
 *    menuItems: [
 *    { id: '1', icon: <BeakerIcon />, title: 'Option 1' },
 *     { id: '2', icon: <ArchiveBoxIcon />, title: 'Option 2' },
 *     { id: '3', icon: <ArchiveBoxIcon />, title: 'Option 3' },
 *    ]
 *    placeholderLabel={'Select an option'}
 *    setSelected={setSelectedHandler}
 *   />
 * ```
 **/
const Dropdown: React.FC<DropdownProps> = props => {
  const { label, placeholderLabel, menuItems, selected, setSelected, required } = props;

  const [dropOpen, setDropOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (placeholderLabel) {
      setSelected(placeholderLabel ?? menuItems[0]);
    } else {
      setSelected(selected ?? menuItems[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optionsWrapperStyle = apply`absolute w-full z-10 max-h-60 ${label ? 'mt-[70px]' : 'mt-[2.7rem]'} rounded-lg overflow-auto bg-(white dark:grey3)`;

  const optionStyle = apply`flex items-center justify-between py-1.5 px-2 bg-(hover:grey8 dark:hover:grey5)`;

  const handleDropClick = () => {
    setDropOpen(!dropOpen);
  };

  const anchorRef = useCloseActions(() => {
    setDropOpen(false);
  });

  const handleChange = (menuItem: string) => () => {
    setSelected(menuItem);
    setDropOpen(!dropOpen);
  };

  return (
    <Stack customStyle="relative min-w-[8rem] gap-y-2 " ref={anchorRef}>
      {label && <Label required={required}>{label}</Label>}
      <button
        className={tx`inline-flex items-center justify-between min-w-[8rem] p-2 rounded-lg bg-(white dark:grey3) rounded-lg border-(1 solid ${
          dropOpen ? 'secondaryLight dark:secondark-dark' : 'grey6 dark:grey5'
        })`}
        onClick={handleDropClick}
        aria-label="dropdown"
        type="button"
      >
        <Text variant="body1">{selected}</Text>
        {dropOpen ? (
          <Icon
            icon={<ChevronUpIcon />}
            customStyle="ml-4"
            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
          />
        ) : (
          <Icon
            icon={<ChevronDownIcon />}
            customStyle="ml-4"
            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
          />
        )}
      </button>

      {/* <!-- Dropdown menu --> */}
      {dropOpen && (
        <Card padding="p-0" elevation="1" customStyle={optionsWrapperStyle}>
          <ul aria-labelledby="dropdownDefaultButton">
            {menuItems.map((menuItem, idx) => {
              const isSelected = selected === menuItem;
              return (
                <Link
                  key={idx}
                  tabIndex={-1}
                  className={`${optionStyle} cursor-pointer`}
                  onClick={handleChange(menuItem)}
                >
                  <Stack
                    direction="row"
                    align="center"
                    spacing="gap-x-2"
                    customStyle={`${isSelected ? 'text-secondaryLight' : 'text-black'} hover:bg-(grey8 dark:grey5)`}
                  >
                    <Text
                      variant="body1"
                      color={
                        isSelected
                          ? { light: 'secondaryLight', dark: 'secondaryDark' }
                          : { light: 'black', dark: 'white' }
                      }
                    >
                      {menuItem}
                    </Text>
                  </Stack>
                  {isSelected && (
                    <span className={tw('ml-4')}>
                      <Icon
                        icon={<CheckIcon />}
                        color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                      />
                    </span>
                  )}
                </Link>
              );
            })}
          </ul>
        </Card>
      )}
    </Stack>
  );
};

export default Dropdown;
