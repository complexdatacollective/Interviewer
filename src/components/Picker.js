import React from 'react';
import NewFilterableListWrapper from './NewFilterableListWrapper';
import { Overlay } from '../containers/Overlay';

const Picker = ({
  show,
  onClose,
  title,
  ItemComponent,
  items,
  searchPropertyPath,
  sortableProperties,
  footer,
  header,
}) => (
  <Overlay
    show={show}
    onClose={onClose}
    title={title}
    footer={footer}
    fullheight
  >
    {header}
    <NewFilterableListWrapper
      ItemComponent={ItemComponent}
      items={items}
      searchPropertyPath={searchPropertyPath}
      sortableProperties={sortableProperties}
    />
    <div style={{ padding: '1.2rem' }} />
  </Overlay>
);

export default Picker;
