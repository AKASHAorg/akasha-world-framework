import * as React from 'react';
import CardRenderer from './card-renderer';
import Spinner from '../Spinner';
import { IListViewportProps } from './interfaces';

const ListViewport: React.FC<IListViewportProps> = props => {
  const {
    itemsData,
    itemSpacing,
    customEntities = [],
    isFetching,
    itemRects,
    listHeight,
    renderSlice,
    averageItemHeight,
    listHeader,
  } = props;

  return (
    <>
      {listHeader && React.cloneElement(listHeader)}
      {renderSlice.map(itemId => {
        return (
          <CardRenderer
            key={itemId}
            itemId={itemId}
            itemCard={props.itemCard}
            itemCardAlt={props.itemCardAlt}
            loadItemData={props.loadItemData}
            itemData={itemsData[itemId]}
            customEntities={customEntities}
            itemSpacing={itemSpacing}
            itemRect={itemRects.get(itemId)}
            updateRef={props.updateRef}
            averageItemHeight={averageItemHeight}
          />
        );
      })}
      {isFetching && (
        <div
          style={{
            position: 'absolute',
            transform: `translateY(${listHeight + itemSpacing}px)`,
            width: '100%',
            minHeight: '5rem',
          }}
        >
          <Spinner />
        </div>
      )}
    </>
  );
};

export default ListViewport;
