import React from 'react';
import NewFilterableListWrapper from './NewFilterableListWrapper';
import { Overlay } from '../containers/Overlay';

const Picker = ({
  show,
  onClose,
  title,
  ItemComponent,
  items,
  propertyPath,
  initialSortProperty,
  initialSortDirection,
  sortableProperties,
  footer,
  header,
}) => {
  return (
    <Overlay
      show={show}
      onClose={onClose}
      title={title}
      fullheight
      fullscreen
      footer={footer}
    >
      { header }
      <NewFilterableListWrapper
        ItemComponent={ItemComponent}
        items={items}
        propertyPath={propertyPath}
        initialSortProperty={initialSortProperty}
        initialSortDirection={initialSortDirection}
        sortableProperties={sortableProperties}
      />
    </Overlay>
  );
};

export default Picker;
