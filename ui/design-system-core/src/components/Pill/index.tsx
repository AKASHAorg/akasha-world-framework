import React, { useState } from 'react';
import Button from '../Button';
import { ButtonProps } from '../Button/types';

export type PillProps = {
  label: ButtonProps['label'];
  size?: ButtonProps['size'];
  icon?: ButtonProps['icon'];
  hover?: { icon: ButtonProps['icon']; active: boolean };
  iconDirection?: ButtonProps['iconDirection'];
  customStyle?: ButtonProps['customStyle'];
  active?: boolean;
  onPillClick?: (active?: boolean) => void;
};

const Pill: React.FC<PillProps> = ({
  label,
  size,
  icon,
  hover,
  iconDirection,
  customStyle = '',
  active,
  onPillClick,
}) => {
  const [showHover, setShowHover] = useState(false);

  const handlePillClick = () => {
    if (onPillClick) {
      onPillClick(!active);
    }
  };

  return (
    <Button
      aria-label="dismiss"
      hover={false}
      label={label}
      size={size}
      icon={showHover && hover ? hover.icon : icon}
      iconDirection={iconDirection}
      customStyle={customStyle}
      active={showHover && hover ? hover.active : active}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
      onClick={handlePillClick}
    />
  );
};

export default Pill;
