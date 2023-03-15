import cn from 'classnames';
import { isEmpty, isNull } from 'lodash-es';
import React from 'react';
import { IHeaderCellProps, ISortOrder } from '../../lib/types.js';
import { filterTypes, sortOrders } from '../lib/utils.js';
import s from './HeaderCell.module.css';
import { Popup, usePopup } from './Popup.js';
import { SearchFilter, SelectFilter } from './TableFilters.js';

const getSortOrderIcon = (sortOrder: ISortOrder) => {
  switch (sortOrder) {
    case sortOrders.asc:
      return '/img/sortDown.svg';
    case sortOrders.desc:
      return '/img/sortUp.svg';
    default:
      return '/img/sort.svg';
  }
};

export const HeaderCell = (props: IHeaderCellProps) => {
  const { children, onSort, name, sortOrder = null, className = '', filterType } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  const { refs, getReferenceProps, popupProps } = usePopup({
    placement: 'bottom-end',
    isOpen,
    setIsOpen,
  });

  const { onClick: onReferenceClick, ...restReferenceProps } = getReferenceProps() as any;
  const stopPropagation = e => e.stopPropagation();
  const onFilterIconClick = e => {
    stopPropagation(e);
    onReferenceClick(e);
  };

  const onSortChange = () => {
    if (isNull(sortOrder)) return onSort(sortOrders.asc, name);
    if (sortOrders.asc === sortOrder) return onSort(sortOrders.desc, name);
    return onSort(null, name);
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
                [s.filterIcon_active]: !isEmpty(props.filter),
              })}
              ref={refs.setReference}
              {...restReferenceProps}
              onClick={onFilterIconClick}
            ></i>
          )}
          <img src={getSortOrderIcon(sortOrder)} className={s.sortIcon} />
        </div>
      </div>

      {filterType && (
        <Popup {...popupProps}>
          <div
            className="p-2 rounded shadow border border-slate-200 bg-white"
            onClick={stopPropagation}
          >
            {filterType === filterTypes.search && (
              <SearchFilter
                name={name}
                filter={props.filter}
                onFilter={props.onFilter}
                setIsOpen={setIsOpen}
              />
            )}
            {filterType === filterTypes.select && (
              <SelectFilter
                name={name}
                filter={props.filter}
                onFilter={props.onFilter}
                setIsOpen={setIsOpen}
                selectFilterOptions={props.selectFilterOptions}
              />
            )}
          </div>
        </Popup>
      )}
    </th>
  );
};
