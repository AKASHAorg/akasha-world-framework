import React, { useEffect, useState } from 'react';
import { useTheme } from '@akashaorg/ui-awf-hooks';
import { ThemingEvents } from '@akashaorg/typings/lib/ui';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  ChevronLeftIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { Akasha } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { startWidgetsTogglingBreakpoint } from '@akashaorg/design-system-core/lib/utils/breakpoints';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { Extension } from '@akashaorg/ui-lib-extensions/lib/react/extension';

export interface ITopbarProps {
  // data
  versionURL?: string;
  currentLocation?: string;
  // sidebar
  sidebarVisible: boolean;
  // isLoggedIn ?
  isLoggedIn: boolean;
  // handlers
  onSidebarToggle?: () => void;
  onBackClick: () => void;
  onAppWidgetClick: () => void;
  onBrandClick?: () => void;
  modalSlotId: string;
}

type WorldIconProps = {
  fallback: React.ReactElement;
};

type ThemeEvent = Event & {
  detail: { theme: 'Light-Theme' | 'Dark-Theme' };
};

const WorldIcon = (props: WorldIconProps) => {
  const { fallback } = props;

  const { theme } = useTheme();
  const [curTheme, setCurTheme] = useState(theme);

  const {
    worldConfig: { worldIcon },
  } = useRootComponentProps();

  useEffect(() => {
    const handleSetTheme = (ev: ThemeEvent) => setCurTheme(ev.detail.theme);
    window.addEventListener(ThemingEvents.ThemeChange, handleSetTheme);
  }, []);

  if (worldIcon) {
    const isLightTheme = curTheme === 'Light-Theme';

    const smallImagePath = `${worldIcon.basePath}${worldIcon.small}${
      isLightTheme ? worldIcon.darkModeSuffix : ''
    }${worldIcon.extension}`;

    const mediumImagePath = `${worldIcon.basePath}${worldIcon.medium}${
      isLightTheme ? worldIcon.darkModeSuffix : ''
    }${worldIcon.extension}`;

    return (
      <img
        loading="lazy"
        decoding="async"
        alt="world logo"
        height="1.5rem"
        className="mb-1"
        src={`${smallImagePath}`}
        srcSet={`${smallImagePath}, ${mediumImagePath} 2x`}
      />
    );
  }
  return <Icon icon={fallback} solid={true} customStyle="w-18 h-7" />;
};

const Topbar: React.FC<ITopbarProps> = props => {
  const {
    isLoggedIn,
    sidebarVisible,
    onSidebarToggle,
    onBrandClick = () => {
      return;
    },
    onAppWidgetClick,
    onBackClick = () => {
      return;
    },
  } = props;

  const [displayWidgetTogglingButton, setDisplayWidgetTogglingButton] = React.useState(
    !window.matchMedia(startWidgetsTogglingBreakpoint).matches,
  );
  React.useEffect(() => {
    const mql = window.matchMedia(startWidgetsTogglingBreakpoint);
    const resize = () => {
      setDisplayWidgetTogglingButton(!mql.matches);
    };
    mql.addEventListener('change', resize);
    return () => {
      mql.removeEventListener('change', resize);
    };
  }, []);

  const customStyle =
    'flex-row justify-between items-center py-1.5 px-2 space-x-4 xs:(fixed top-0 z-8)';

  return (
    <Card customStyle={customStyle}>
      <Stack direction="row" spacing="gap-x-2">
        <Button
          iconOnly={true}
          icon={sidebarVisible ? <ArrowLeftEndOnRectangleIcon /> : <ArrowRightEndOnRectangleIcon />}
          onClick={onSidebarToggle}
          greyBg={true}
          variant="primary"
        />
        <Button
          iconOnly={true}
          greyBg={true}
          variant="primary"
          icon={<ChevronLeftIcon />}
          onClick={onBackClick}
        />
      </Stack>
      <Button plain={true} customStyle="p-0 !ml-0 cursor-pointer" onClick={onBrandClick}>
        <Stack align="center" justify="center" direction="column" spacing="gap-y-1">
          <WorldIcon fallback={<Akasha />} />
          <Pill
            type="info"
            label="Alpha"
            weight="light"
            color="white"
            size="xs"
            background={{ light: 'errorLight', dark: 'errorDark' }}
            borderColor={{ light: 'errorLight', dark: 'errorDark' }}
          />
        </Stack>
      </Button>
      <Stack direction="row" spacing="gap-x-2">
        {!isLoggedIn && <Extension name="topbar_login_button" />}
        {isLoggedIn && (
          <>
            {displayWidgetTogglingButton && (
              <Button
                iconOnly={true}
                icon={<Akasha />}
                solidIcon={true}
                onClick={onAppWidgetClick}
                variant="primary"
              />
            )}
            <Extension name="topbar_notification_button" />
          </>
        )}
      </Stack>
    </Card>
  );
};

export default Topbar;
