import React from 'react';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export type UnsavedChangesModalProps = {
  showModal: boolean;
  cancelButtonLabel: string;
  leavePageButtonLabel: string;
  title: string;
  description: string;
  handleModalClose: () => void;
  handleLeavePage: () => void;
};

/**
 * The UnsavedChangesModal composes the Modal component and is used to prompt user of any unsaved changes before navigating away from a page.
 * It is currently implemented in:
 * - edit profile page
 * - beam editor page
 * - edit profile interests page
 */
const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = props => {
  const {
    showModal,
    cancelButtonLabel,
    leavePageButtonLabel,
    title,
    description,
    handleModalClose,
    handleLeavePage,
  } = props;
  return (
    <Modal
      show={showModal}
      actions={[
        {
          label: cancelButtonLabel,
          variant: 'secondary',
          onClick: handleModalClose,
        },
        {
          label: leavePageButtonLabel,
          variant: 'primary',
          onClick: handleLeavePage,
        },
      ]}
      title={{
        label: title,
        variant: 'h6',
      }}
      customStyle="py-4 px-6 md:px-24"
      onClose={handleModalClose}
    >
      <Text variant="body1" weight="light">
        {description}
      </Text>
    </Modal>
  );
};

export default UnsavedChangesModal;
