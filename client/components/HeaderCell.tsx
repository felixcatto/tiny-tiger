import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import React from 'react';
import { IHeaderCellProps } from '../../lib/types.js';
import { filterTypes, sortOrders } from '../lib/utils.js';
import s from './HeaderCell.module.css';
import { Popup, usePopup } from './Popup.js';
import { SearchFilter, SelectFilter } from './TableFilters.js';

const sortOrderIconSrcs = {
  [sortOrders.none]: '/img/sort.svg',
  [sortOrders.asc]: '/img/sortDown.svg',
  [sortOrders.desc]: '/img/sortUp.svg',
};

export const HeaderCell = (props: IHeaderCellProps) => {
  const {
    children,
    onSort,
    name,
    sortOrder = sortOrders.none,
    className = '',
    filter,
    onFilter,
    filterType,
    selectFilterData,
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  const { x, y, strategy, refs, getReferenceProps, getFloatingProps, context } = usePopup({
    placement: 'bottom-end',
    isOpen,
    setIsOpen,
  });
  const popupProps = { isOpen, x, y, strategy, refs, getFloatingProps, context };

  const { onClick: onReferenceClick, ...restReferenceProps } = getReferenceProps() as any;
  const stopPropagation = e => e.stopPropagation();
  const onFilterIconClick = e => {
    stopPropagation(e);
    onReferenceClick(e);
  };

  const onSortChange = () => {
    if (sortOrders.none === sortOrder) return onSort(sortOrders.asc, name);
    if (sortOrders.asc === sortOrder) return onSort(sortOrders.desc, name);
    return onSort(sortOrders.none, name);
  };

  return (
    <th
      className={cn(s.headCell, className)}
      onClick={onSortChange}
      ref={refs.setPositionReference}
    >
      <div className="flex items-center justify-between p-2">
        <div>{children}</div>
        <div className="flex items-center">
          {filterType && (
            <i
              className={cn('fa fa-filter', s.filterIcon, {
                [s.filterIcon_active]: !isEmpty(filter),
              })}
              ref={refs.setReference}
              {...restReferenceProps}
              onClick={onFilterIconClick}
            ></i>
          )}
          <img src={sortOrderIconSrcs[sortOrder]} className={s.sortIcon} />
        </div>
      </div>

      {filterType && (
        <Popup {...popupProps}>
          <div
            className="p-2 rounded shadow border border-slate-200 bg-white"
            onClick={stopPropagation}
          >
            {filterType === filterTypes.search && (
              <SearchFilter name={name} filter={filter} onFilter={onFilter} setIsOpen={setIsOpen} />
            )}
            {filterType === filterTypes.select && (
              <SelectFilter
                name={name}
                filter={filter}
                onFilter={onFilter}
                setIsOpen={setIsOpen}
                selectFilterData={selectFilterData}
              />
            )}
          </div>
        </Popup>
      )}
    </th>
  );
};
