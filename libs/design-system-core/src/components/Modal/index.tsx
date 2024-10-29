import React, { Fragment, PropsWithChildren } from 'react';
import { tw } from '@twind/core';
import { Dialog, Transition } from '@headlessui/react';

import Button from '../Button';
import { ButtonProps } from '../Button/types';
import Card from '../Card';
import Divider from '../Divider';
import Icon from '../Icon';
import { XMarkIcon } from '../Icon/hero-icons-outline';
import Stack from '../Stack';
import Text, { TextProps } from '../Text';

export type ModalProps = PropsWithChildren<{
  show: boolean;
  actions?: ButtonProps[];
  title?: { label: string } & TextProps;
  showDivider?: boolean;
  rightAlignActions?: boolean;
  customStyle?: string;
  onClose?: () => void;
}>;

/**
 * A Modal component displays content in a dialog box in a layer above the main application's
 * content to grab the user's attention.
 * @param show - boolean that control the show/hide state of the modal
 * @param actions - (optional) a list of Button props that will be made available in the modal dialogue
 * for the user to take action
 * @param title - (optional) title of the modal coupled with customization props (please use Text component's props)
 * @param showDivider - boolean (optional) whether to show the divider
 * @param rightAlignActions - boolean (optional) align action buttons to the right
 * @param customStyle - (optional) apply your custom styling (Make sure to use standard Tailwind classes)
 * @param onClose - (optional) handler that will be called when clicking the close icon
 * @example
 * ```tsx
 *      <Modal
 *        show={true}
 *        title={{
 *        label: 'Are you sure you want to delete this?',
 *         variant: 'h6',
 *         }}
 *         actions={[
 *         { label: 'Cancel', variant: 'secondary', onClick: handleModalClose },
 *         { label: 'Remove', variant: 'primary', onClick: handleRemove },
 *         ]}
 *         onClose={handleModalClose}
 *   >
 * ```
 **/
const Modal: React.FC<ModalProps> = ({
  show,
  actions,
  title,
  showDivider = false,
  rightAlignActions = false,
  customStyle = '',
  children,
  onClose = () => {},
}) => {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" onClose={onClose} className={tw('relative z-[11]')}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Stack align="center" justify="center" customStyle="fixed inset-0">
            <Stack customStyle="w-fit -ml(md:6)">
              <Dialog.Panel>
                <Card radius={20} padding={'py-4'} customStyle={`${customStyle} relative`}>
                  <Stack direction="column" spacing="gap-y-4">
                    {title && (
                      <Dialog.Title as="div">
                        <Text align="center" variant="h5" {...title}>
                          {title.label}
                        </Text>
                        <Button onClick={onClose} plain customStyle="absolute top-4 right-4">
                          <Icon
                            icon={<XMarkIcon />}
                            size="md"
                            color={{ light: 'grey4', dark: 'grey7' }}
                          />
                        </Button>
                      </Dialog.Title>
                    )}

                    {showDivider && <Divider />}

                    <Stack
                      align="center"
                      justify="center"
                      direction="column"
                      spacing="gap-y-4"
                      customStyle="px-4"
                    >
                      {children}
                      {actions && (
                        <Stack
                          direction="row"
                          spacing="gap-x-4"
                          customStyle={`mt-auto ${rightAlignActions ? 'ml-auto' : ''}`}
                        >
                          {actions.map((action, index) => (
                            <Button key={index} size="md" {...action} />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </Dialog.Panel>
            </Stack>
          </Stack>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
