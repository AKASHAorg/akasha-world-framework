import React, { ReactNode, useState } from 'react';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { ChatBubbleLeftRightIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-solid';

export type CardActionProps = {
  itemId: string;
  reflectAnchorLink?: string;
  disableActions?: boolean;
  actionsRight?: ReactNode;
  reflectionsCount?: number;
  onReflect: () => void;
  customStyle?: string;
};

const CardActions: React.FC<CardActionProps> = props => {
  const {
    itemId,
    reflectAnchorLink,
    disableActions,
    actionsRight,
    reflectionsCount,
    onReflect,
    customStyle = '',
  } = props;
  const [hovered, setHovered] = useState(false);
  const reflectIconUi = (
    <Card
      onMouseEnter={() => {
        if (!disableActions) setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      type="plain"
    >
      {hovered ? (
        <Icon
          icon={<ChatBubbleLeftRightIconSolid />}
          disabled={disableActions}
          accentColor={true}
          solid
        />
      ) : (
        <Icon icon={<ChatBubbleLeftRightIcon />} disabled={disableActions} accentColor={true} />
      )}
    </Card>
  );
  return (
    <Stack direction="row" align="center" justify="end" spacing="gap-x-2" customStyle={customStyle}>
      <>{actionsRight}</>
      <Link
        to={`${reflectAnchorLink}/${itemId}`}
        onClick={() => {
          if (!disableActions) onReflect();
        }}
        customStyle={`h-fit cursor-${disableActions ? 'not-allowed' : 'pointer'}`}
      >
        {reflectionsCount ? (
          <Stack dataTestId="reflections-count" direction="row" align="end" spacing="gap-x-1">
            {reflectIconUi}
            <Text
              variant="body2"
              weight="normal"
              color={{
                light: 'secondaryLight',
                dark: 'secondaryDark',
              }}
              {...(disableActions && { customStyle: 'opacity-50' })}
            >
              {reflectionsCount}
            </Text>
          </Stack>
        ) : (
          reflectIconUi
        )}
      </Link>
    </Stack>
  );
};

export default CardActions;
