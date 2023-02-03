const getIsPortrait = (width, height) => width / height < 1;

export const getExpandedSize = (bounds) => (
  bounds.height > (bounds.width * 0.67)
    ? Math.floor(bounds.width * 0.67)
    : bounds.height
);

export const getItemSize = (bounds, itemCount, expanded = false) => {
  const expandedSize = getExpandedSize(bounds);

  const width = expanded ? bounds.width - expandedSize : bounds.width;

  const isPortrait = getIsPortrait(width, bounds.height);

  const unexpandedItemCount = expanded ? itemCount - 1 : itemCount;

  const shortCount = [4, 5, 6, 7, 8].includes(unexpandedItemCount) ? 2 : 1;
  const longCount = shortCount > 1 ? Math.ceil(unexpandedItemCount / 2) : unexpandedItemCount;

  const longSide = isPortrait ? bounds.height : width;
  const shortSide = isPortrait ? width : bounds.height;

  const x = Math.floor(longSide / longCount);
  const y = Math.floor(shortSide / shortCount);
  const z = x < y ? x : y;

  return z;
};
