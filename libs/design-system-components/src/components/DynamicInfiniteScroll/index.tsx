import React, {
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { Virtualizer, measureElement, useWindowVirtualizer } from '@tanstack/react-virtual';
import { useScrollRestoration } from './use-scroll-restoration';
import { getMinHeight, restoreScrollConfig } from './use-scroll-restoration/utils';
import { useMedia } from 'react-use';

type DynamicInfiniteScrollItem = {
  index: number;
  itemIndex: number;
  itemsSize: number;
};

export type DynamicInfiniteScrollProps = {
  count: number;
  estimatedHeight: number;
  enableScrollRestoration?: boolean;
  scrollRestorationStorageKey?: string;
  lastScrollRestorationKey?: string;
  lanes?: number;
  overScan?: number;
  itemSpacing?: number;
  hasNextPage?: boolean;
  loading?: boolean;
  header?: ReactElement;
  dataTestId?: string;
  listWrapperStyle?: string;
  customStyle?: string;
  onLoadMore: () => Promise<unknown> | void;
  children: (item: DynamicInfiniteScrollItem) => ReactElement;
};

//@todo rename component to InfiniteScroll and create a storybook for it
const DynamicInfiniteScroll: React.FC<DynamicInfiniteScrollProps> = props => {
  const {
    count,
    estimatedHeight,
    enableScrollRestoration = false,
    scrollRestorationStorageKey = 'storage-key',
    lastScrollRestorationKey,
    lanes,
    overScan = 5,
    itemSpacing,
    hasNextPage,
    loading,
    header,
    dataTestId,
    listWrapperStyle = '',
    customStyle = '',
    onLoadMore,
    children,
  } = props;

  const parentRef = useRef(null);
  const scrollRestorationStorageKeyRef = useRef(scrollRestorationStorageKey);
  const lastScrollRestorationKeyRef = useRef(lastScrollRestorationKey);
  const parentOffsetRef = React.useRef(0);
  const isMobileScreen = useMedia('(max-width: 640px)');
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeightStyle = useRef('');

  const getHeaderHeight = useCallback(() => {
    const scrollConfig = restoreScrollConfig(scrollRestorationStorageKeyRef.current);
    if (!scrollConfig || typeof scrollConfig !== 'object') return null;
    if (
      scrollConfig.lastScrollRestorationKey &&
      lastScrollRestorationKeyRef.current !== scrollConfig.lastScrollRestorationKey
    )
      return null;
    return typeof scrollConfig.headerHeight === 'number' ? scrollConfig.headerHeight : null;
  }, []);

  const getInitialMeasurementsCache = useCallback(() => {
    const scrollConfig = restoreScrollConfig(scrollRestorationStorageKeyRef.current);
    if (
      !scrollConfig ||
      typeof scrollConfig !== 'object' ||
      typeof scrollConfig.options !== 'object'
    )
      return [];
    return scrollConfig.options.initialMeasurementsCache;
  }, []);

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, [parentRef.current?.offsetTop]);

  useLayoutEffect(() => {
    const headerHeight = getHeaderHeight();
    if (headerHeight) headerHeightStyle.current = `min-h-[${headerHeight}px]`;
  }, [getHeaderHeight]);

  const virtualizer = useWindowVirtualizer({
    count,
    lanes,
    overscan: overScan,
    gap: itemSpacing,
    initialMeasurementsCache: getInitialMeasurementsCache(),
    scrollMargin: parentOffsetRef.current,
    measureElement: isMobileScreen
      ? (element, entry, instance) => {
          const dataIndex = instance.indexFromElement(element);
          if (instance.scrollDirection === 'backward' && instance.measurementsCache?.[dataIndex]) {
            return instance.measurementsCache[dataIndex].size;
          }
          return measureElement(element, entry, instance);
        }
      : measureElement,
    estimateSize: () => estimatedHeight,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const loadingMore = loading && hasNextPage && virtualItems.length > 0;

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) {
      return;
    }

    if (hasNextPage && !loading && lastItem.index >= count - 1) {
      onLoadMore();
    }
  }, [hasNextPage, count, loading, onLoadMore, virtualItems]);

  const vListOffset = virtualItems?.[0]?.start
    ? virtualItems?.[0]?.start - virtualizer.options.scrollMargin
    : 0;

  const virtualListUi = (
    <>
      {header && (
        <Stack ref={headerRef} customStyle={headerHeightStyle.current}>
          {header}
        </Stack>
      )}
      <Card
        ref={parentRef}
        customStyle={`relative w-full min-h-[${virtualizer.isScrolling && loading && hasNextPage ? totalSize + overScan * estimatedHeight : totalSize}px] ${customStyle}`}
        dataTestId={dataTestId}
        type="plain"
      >
        <Card
          data-offset={vListOffset}
          customStyle={`flex flex-col absolute w-full top-0 left-0 translate-y-[${vListOffset}px] gap-y-[${itemSpacing}px] ${listWrapperStyle}`}
          type="plain"
        >
          {virtualItems.map((virtualItem, index, items) => (
            <Card
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              type="plain"
              customStyle={
                loading
                  ? `min-h-[${estimatedHeight}px]`
                  : getMinHeight({
                      virtualizer,
                      virtualItemIndex: virtualItem.index,
                      virtualItemSize: virtualItem.size,
                    })
              }
            >
              {children({ index, itemIndex: virtualItem.index, itemsSize: items.length })}
            </Card>
          ))}
          <Stack align="center" justify="center" fullWidth>
            {loadingMore && <Spinner />}
          </Stack>
        </Card>
      </Card>
    </>
  );

  return enableScrollRestoration ? (
    <WithScrollRestoration
      virtualizer={virtualizer}
      scrollRestorationStorageKey={scrollRestorationStorageKey}
      lastScrollRestorationKey={lastScrollRestorationKey}
      count={count}
      overScan={overScan}
      headerRef={headerRef}
      offsetAttribute="data-offset"
    >
      {virtualListUi}
    </WithScrollRestoration>
  ) : (
    <>{virtualListUi}</>
  );
};

type WithScrollRestorationProps = {
  virtualizer: Virtualizer<Window, Element>;
  scrollRestorationStorageKey: string;
  lastScrollRestorationKey: string;
  count: number;
  overScan: number;
  headerRef?: MutableRefObject<HTMLDivElement>;
  offsetAttribute: string;
};

const WithScrollRestoration: React.FC<PropsWithChildren<WithScrollRestorationProps>> = props => {
  const {
    virtualizer,
    scrollRestorationStorageKey,
    count,
    overScan,
    offsetAttribute,
    lastScrollRestorationKey,
    headerRef,
    children,
  } = props;
  const scrollRestorationStorageKeyRef = useRef(scrollRestorationStorageKey);
  useScrollRestoration({
    virtualizer,
    count,
    overScan,
    scrollRestorationStorageKey: scrollRestorationStorageKeyRef.current,
    offsetAttribute,
    lastScrollRestorationKey,
    headerRef,
  });
  return <>{children}</>;
};

export default DynamicInfiniteScroll;
