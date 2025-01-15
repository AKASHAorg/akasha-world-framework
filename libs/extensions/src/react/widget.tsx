import * as React from 'react';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { useRoutingEvents } from './use-routing-events';
import { WidgetInterface, IWidgetStorePlugin } from '@akashaorg/typings/lib/ui';
import Parcel from 'single-spa-react/parcel';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';

export type WidgetExtensionProps = {
  name: string;
  loadingIndicator?: React.ReactNode;
  onError?: (widget: WidgetInterface & { appName: string }, message?: string) => void;
  customStyle?: string;
  fullHeight?: boolean;
};

export const Widget: React.FC<WidgetExtensionProps> = props => {
  const { name, loadingIndicator, onError, customStyle = '', fullHeight } = props;
  const { getCorePlugins, getContext, logger } = useRootComponentProps();
  const widgetStore = React.useRef<IWidgetStorePlugin>(getCorePlugins().widgetStore);
  const [parcelConfigs, setParcelConfigs] = React.useState([]);
  const location = useRoutingEvents();

  const [isParcelMounted, setIsParcelMounted] = React.useState(false);

  const widgets = React.useMemo(() => {
    if (!widgetStore.current) return [];
    return widgetStore.current.getMatchingWidgets(name, location);
  }, [location, name]);

  React.useEffect(() => {
    for (const parcelConf of widgets) {
      widgetStore.current.onWidgetUnload(parcelConf.appName, () => {
        setParcelConfigs(prev =>
          prev.filter(parcel => parcel.widget.appName !== parcelConf.appName),
        );
        setIsParcelMounted(false);
      });
    }
  }, [widgets]);

  React.useEffect(() => {
    const resolveConfigs = async () => {
      const newWidgets = [];

      for (const widget of widgets) {
        if (newWidgets.find(p => p.widget.appName === widget.appName)) return;
        try {
          const config = await widget.loadingFn();
          newWidgets.push({ config, widget });
        } catch (err) {
          logger.error(`error getting widget config, ${widget.appName}`);
          onError?.(widget);
        }
      }

      setParcelConfigs(newWidgets);
    };

    resolveConfigs().catch();
  }, [widgets, onError, logger]);

  const handleParcelError = React.useCallback(
    (widget, index: number) => err => {
      onError?.(widget, `Failed to mount: ${err.message}`);
      if (logger) logger.error(`Failed to mount parcel: ${widget.appName}_${index}`);
    },
    [logger, onError],
  );

  const loadingConfiguredParcel = parcelConfigs.length > 0 ? !isParcelMounted : false;
  const isLoading = widgets.length > parcelConfigs.length || loadingConfiguredParcel;

  return (
    <Stack customStyle={`${customStyle} ${fullHeight ? 'h-full' : ''}`} id={name}>
      {isLoading && loadingIndicator}
      {parcelConfigs.map((parcelConf, index) => (
        <Parcel
          wrapStyle={{
            display: isLoading ? 'none' : undefined,
          }}
          parcelDidMount={() => {
            setIsParcelMounted(true);
          }}
          key={parcelConf.widget.appName}
          config={{
            ...parcelConf.config,
            name: `${parcelConf.widget.appName}_${index}`,
          }}
          {...getContext()}
          handleError={handleParcelError(parcelConf.widget, index)}
        />
      ))}
    </Stack>
  );
};
