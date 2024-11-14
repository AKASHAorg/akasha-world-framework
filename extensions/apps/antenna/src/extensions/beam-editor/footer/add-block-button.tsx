import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { PlusIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

export type AddBlockButtonProps = {
  disabled?: boolean;
  addBlockLabel?: string;
  handleClickAddBlock?: () => void;
};

export const AddBlock: React.FC<AddBlockButtonProps> = props => {
  const { disabled = false, addBlockLabel, handleClickAddBlock } = props;
  return (
    <Button
      greyBg={true}
      variant="text"
      size="md"
      icon={<PlusIcon />}
      iconDirection="left"
      label={addBlockLabel}
      disabled={disabled}
      onClick={handleClickAddBlock}
    />
  );
};
