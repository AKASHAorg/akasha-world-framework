import React from 'react';
import Modal, { ModalProps } from '@akashaorg/design-system-core/lib/components/Modal';
import Text from '@akashaorg/design-system-core/lib/components/Text';

type DeleteImageModalProps = {
  title: ModalProps['title'];
  show: ModalProps['show'];
  cancelLabel: string;
  deleteLabel: string;
  confirmationLabel: string;
  onDelete: () => void;
  onClose: ModalProps['onClose'];
};

export const DeleteImageModal: React.FC<DeleteImageModalProps> = ({
  show,
  title,
  cancelLabel,
  deleteLabel,
  confirmationLabel,
  onDelete,
  onClose,
}) => {
  return (
    <Modal
      show={show}
      title={title}
      actions={[
        { variant: 'secondary', label: cancelLabel, onClick: onClose },
        { variant: 'primary', label: deleteLabel, onClick: onDelete },
      ]}
      onClose={onClose}
      customStyle="min-w-[20rem] sm:min-w-[38rem]"
    >
      <Text variant="body1">{confirmationLabel}</Text>
    </Modal>
  );
};
