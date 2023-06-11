import React from 'react';
import { tw } from '@twind/core';
import Accordion from '@akashaorg/design-system-core/lib/components/Accordion';
import Box from '@akashaorg/design-system-core/lib/components/Box';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Snackbar, { SnackBarType } from '@akashaorg/design-system-core/lib/components/Snackbar';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';
import routes, {
  CUSTOMIZE_NOTIFICATION_CONFIRMATION_PAGE,
  SHOW_NOTIFICATIONS_PAGE,
} from '../../routes';
import { RootComponentProps, EventTypes } from '@akashaorg/typings/ui';
import { useTranslation } from 'react-i18next';

interface ICustomizeNotificationPageProps extends RootComponentProps {
  initial?: boolean;
}

const Title = ({ title }: { title: string }): JSX.Element => {
  return (
    <div className={tw('flex flex-row items-center')}>
      <Text variant="h6" align="center">
        {title}
      </Text>
    </div>
  );
};

const CustomizeNotificationPage: React.FC<ICustomizeNotificationPageProps> = ({
  initial = true,
  ...props
}) => {
  const { t } = useTranslation('app-notifications');
  const { plugins } = props;

  const [selected, setSelected] = React.useState(true);

  const antennaAppCheckboxes = React.useMemo(
    () => [
      {
        label: t('New Followers'),
        value: 'New Followers',
        selected: true,
      },
      {
        label: t('Replies to my beam'),
        value: 'Replies to my beam',
        selected: true,
      },
      {
        label: t('Mentions me in a beam / reflection'),
        value: 'Mentions me in a beam / reflection',
        selected: true,
      },
      {
        label: t('Someone sharing my beam'),
        value: 'Someone sharing my beam',
        selected: true,
      },
      {
        label: t('When someone I am following beams new content'),
        value: 'When someone I am following beams new content',
        selected: true,
      },
      {
        label: t('When there’s new content in topics I’m Subscribed to'),
        value: 'When there’s new content in topics I’m Subscribed to',
        selected: true,
      },
    ],
    [t],
  );

  const beamAppCheckboxes = React.useMemo(
    () => [
      {
        label: t('Replies to my Beam'),
        value: 'Replies to my Beam',
        selected: true,
      },
      {
        label: t('Quotes me in an Beam.'),
        value: 'Quotes me in an Beam',
        selected: true,
      },
      {
        label: t('Someone shares my Beam'),
        value: 'Someone shares my Beam',
        selected: true,
      },
    ],
    [t],
  );
  const vibeAppCheckboxes = React.useMemo(
    () => [
      {
        label: t('My content gets delisted/kept'),
        value: 'My content gets delisted/kept',
        selected: true,
      },
    ],
    [t],
  );
  const integrationCenterCheckboxes = React.useMemo(
    () => [
      {
        label: t('New versions of installed integrations'),
        value: 'New versions of installed integrations',
        selected: true,
      },
    ],
    [t],
  );

  const [allStates, setAllStates] = React.useState({
    antenna: antennaAppCheckboxes.map(e => e.selected),
    beamApp: beamAppCheckboxes.map(e => e.selected),
    vibeApp: vibeAppCheckboxes.map(e => e.selected),
    integrationCenter: integrationCenterCheckboxes.map(e => e.selected),
  });

  // for displaying feedback messages
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');

  const [showFeedback, setShowFeedback] = React.useState(false);

  if (showFeedback) {
    setTimeout(() => {
      setShowFeedback(false);
      setMessage('');
    }, 6000);
  }

  const [snoozed, setSnoozed] = React.useState(false);

  // check if snooze notification option has already been set
  React.useEffect(() => {
    if (window.localStorage) {
      setSnoozed(JSON.parse(localStorage.getItem('notifications-snoozed')));
    }
  }, []);

  //for the button, disabled when no change made, enabled when there's an change
  // const [updateButtonDisabled, setUpdateButtonDisabled] = React.useState(true);
  const [isChanged, setIsChanged] = React.useState(false);

  const snoozeChangeHandler = () => {
    setSnoozed(!snoozed);
  };

  const navigateTo = plugins['@akashaorg/app-routing']?.routing.navigateTo;

  // added for emitting snooze notification event
  const uiEvents = React.useRef(props.uiEvents);

  const changeHandler = (pos: number, section: string): void => {
    const stateArray = (() => {
      switch (section) {
        case 'antenna':
          return allStates.antenna;
        case 'beamApp':
          return allStates.beamApp;
        case 'vibeApp':
          return allStates.vibeApp;
        case 'integrationCenter':
          return allStates.integrationCenter;
      }
    })();
    const updatedCheckedState = stateArray.map((item, idx) => (idx === pos ? !item : item));
    setAllStates({ ...allStates, [section]: updatedCheckedState });
    setIsChanged(true);
  };

  const Content = ({
    checkboxArray,
    section,
  }: {
    checkboxArray: Array<{ label: string; value: string; selected: boolean }>;
    section: string;
  }): JSX.Element => {
    return (
      <div>
        {checkboxArray.map(({ label, value }, index) => {
          return (
            <div className={tw('')} key={index}>
              <Checkbox
                label={label}
                value={value}
                id={index.toString()}
                isSelected={allStates[section][index]}
                handleChange={() => changeHandler(index, section)}
                name={label}
                customStyle="mb-4"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // detects if user changes any of the setting options and then enable the Update button
  // React.useEffect(() => {
  //   // setUpdateButtonDisabled(!updateButtonDisabled);
  //   setIsChanged(!isChanged);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isChanged]);

  // auto-selects all when I want to receive all notification is checked
  React.useEffect(() => {
    if (selected == true) {
      setAllStates({
        ...allStates,
        antenna: Array(antennaAppCheckboxes.length).fill(true),
        beamApp: Array(beamAppCheckboxes.length).fill(true),
        vibeApp: Array(vibeAppCheckboxes.length).fill(true),
        integrationCenter: Array(integrationCenterCheckboxes.length).fill(true),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const goToNextStep = () => {
    // navigate to final step or go back to notifications page depending whether it's the first time accessing the app or not
    return navigateTo?.({
      appName: '@akashaorg/app-notifications',
      getNavigationUrl: () =>
        initial
          ? routes[CUSTOMIZE_NOTIFICATION_CONFIRMATION_PAGE]
          : `${routes[SHOW_NOTIFICATIONS_PAGE]}/?message=${message}&type=success`,
    });
  };

  const skipHandler = () => {
    // save to localstorage so we don't come back again after skipping
    if (window.localStorage) {
      localStorage.setItem('notification-preference', JSON.stringify('1')); // @TODO: where to save settings?
    }

    // navigate to final step
    goToNextStep();
  };

  const confirmHandler = () => {
    // @TODO: save preferences somewhere, now we just save a key in localstorage to mark as set
    try {
      if (window.localStorage) {
        localStorage.setItem('notification-preference', JSON.stringify('1')); // @TODO: where to save settings?
        setMessage('Notification settings updated successfully');

        if (snoozed && !localStorage.getItem('notifications-snoozed')) {
          localStorage.setItem('notifications-snoozed', JSON.stringify(true));

          // emit snooze notification event so the topbar's notification icon can be updated
          uiEvents.current.next({
            event: EventTypes.SnoozeNotifications,
          });
          setMessage('You have snoozed your notifications successfully');
        }

        if (!snoozed && localStorage.getItem('notifications-snoozed')) {
          localStorage.removeItem('notifications-snoozed');

          // emit unsnooze notification event so the topbar's notification icon can be updated
          uiEvents.current.next({
            event: EventTypes.UnsnoozeNotifications,
          });
          setMessage('You have unsnoozed your notifications successfully');
        }
      }

      // disable the button again after saving preferences
      // setUpdateButtonDisabled(true);
      setIsChanged(false);

      // navigate to final step
      initial && goToNextStep();
    } catch (error) {
      setMessage('Something went wrong. Retry');
      setMessageType('error');
    }
    setShowFeedback(true);
  };

  return (
    <>
      <Card
        direction="row"
        elevation={'1'}
        radius={16}
        padding={{ x: 8, y: 8 }}
        customStyle="h-full md:h-min space-y-4"
      >
        <Text variant="h5" align="center">
          {initial ? ' Customize Your Notifications' : 'Notifications Settings'}
        </Text>
        {!initial && (
          <>
            <Divider customStyle="my-2" />
            <Box customStyle="flex justify-between">
              <Text variant="footnotes2">
                <>{t('Snooze Notifications')}</>
              </Text>
              <Toggle
                iconChecked="BellSnoozeIcon"
                iconUnchecked="BellAlertIcon"
                checked={snoozed}
                onChange={snoozeChangeHandler}
              />
            </Box>
            <Divider customStyle="my-2" />
          </>
        )}
        {initial ? (
          <Text variant="footnotes2" color={{ dark: 'grey6', light: 'grey4' }}>
            <>
              {t(
                'Choose the notifications that you would like to receive from other applications. Remember, you can change this anytime from the notifications settings.',
              )}
            </>
          </Text>
        ) : (
          <Text variant="h6">
            <>{t('Receiving Notifications')}</>
          </Text>
        )}
        <Checkbox
          id="receive-all-notifications-checkbox"
          label={t('I want to receive all types of notifications')}
          value="I want to receive all types of notifications"
          name="check-all"
          isSelected={selected}
          handleChange={() => {
            setSelected(!selected);
            !initial && setIsChanged(true);
          }}
          customStyle="ml-2"
        />
        <Divider customStyle="my-2" />
        <div className={tw('min-h-[80%]')}>
          <Accordion
            titleNode={<Title title={t('Antenna App')} />}
            contentNode={<Content checkboxArray={antennaAppCheckboxes} section={'antenna'} />}
            open={initial}
          />
          <Divider customStyle="my-2" />
          <Accordion
            titleNode={<Title title={t('Beam App')} />}
            contentNode={<Content checkboxArray={beamAppCheckboxes} section={'beamApp'} />}
            open={initial}
          />
          <Divider customStyle="my-2" />
          <Accordion
            titleNode={<Title title={t('Vibe App')} />}
            contentNode={<Content checkboxArray={vibeAppCheckboxes} section={'vibeApp'} />}
            open={initial}
          />
          <Divider customStyle="my-2" />
          <Accordion
            titleNode={<Title title={t('AKASHAverse')} />}
            contentNode={
              <Content checkboxArray={integrationCenterCheckboxes} section={'integrationCenter'} />
            }
            open={initial}
          />
        </div>
        <div className={tw('w-full flex justify-end space-x-4 pr-2 pb-2')}>
          {initial ? (
            <>
              <Button
                variant="text"
                label={t('Do it later')}
                color="secondaryLight dark:secondaryDark"
                onClick={skipHandler}
              />
              <Button variant="primary" label={t('Confirm')} onClick={confirmHandler} />
            </>
          ) : (
            <>
              <Button
                variant="text"
                label={t('Cancel')}
                color="secondaryLight dark:secondaryDark"
                onClick={skipHandler}
              />
              <Button
                variant="primary"
                label={t('Update')}
                onClick={confirmHandler}
                disabled={!isChanged}
              />
            </>
          )}
        </div>
      </Card>
      {showFeedback && (
        <div className={tw('-mt-12 md:mt-4 z-50 w-full')}>
          <Snackbar
            title={message}
            type={messageType as SnackBarType}
            handleDismiss={() => setShowFeedback(false)}
          />
        </div>
      )}
    </>
  );
};
export default CustomizeNotificationPage;
