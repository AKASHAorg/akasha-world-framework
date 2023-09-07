import { useEffect, useState } from 'react';
import { EventTypes } from '@akashaorg/typings/ui';
import { useRootComponentProps } from './use-root-props';

export type theme = 'Light-Theme' | 'Dark-Theme';

export const useTheme = () => {
  const { uiEvents } = useRootComponentProps();

  // get the current theme from local storage
  const currentTheme = window.localStorage.getItem('Theme') as theme;

  const [theme, setTheme] = useState<theme>(currentTheme);

  const propagateTheme = (_theme: theme, setToLocal?: boolean) => {
    setTheme(_theme);

    if (setToLocal) {
      window.localStorage.setItem('Theme', _theme);
    }

    /*
     * Custom event used in main html file to update the theme in the <body> tag
     */
    const ev = new CustomEvent(EventTypes.ThemeChange, {
      detail: {
        theme: _theme,
      },
    });

    window.dispatchEvent(ev);

    /*
     * Propagate the change to all apps and widgets
     */
    uiEvents.next({
      event: EventTypes.ThemeChange,
      data: {
        name: _theme,
      },
    });
  };

  useEffect(() => {
    /**
     * if no theme is set on local storage, default to user's preference (auto)
     */
    const setThemeFromUserPref = ({ matches }) => {
      if (!currentTheme) {
        propagateTheme(matches ? 'Dark-Theme' : 'Light-Theme');
      }
    };

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', setThemeFromUserPref);

    return window
      .matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', setThemeFromUserPref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { theme, propagateTheme };
};
