import React from 'react';
import cn from 'classnames';
import { makeEnum, sortOrders } from '../lib/utils.js';
import s from './HeaderCell.module.css';
import { ISortOrder } from '../../lib/types.js';

const sortOrderIconSrcs = {
  [sortOrders.none]: '/img/sort.svg',
  [sortOrders.asc]: '/img/sortDown.svg',
  [sortOrders.desc]: '/img/sortUp.svg',
};

type IHeaderCellProps = {
  children: any;
  onSort: (sortOrder: ISortOrder) => void;
  sortOrder?: ISortOrder;
  className?: string;
  filterable?: boolean;
};

export const HeaderCell = (props: IHeaderCellProps) => {
  const {
    children,
    onSort,
    sortOrder = sortOrders.none,
    className = '',
    filterable = false,
  } = props;

  const onClick = () => {
    if (sortOrders.none === sortOrder) return onSort(sortOrders.asc);
    if (sortOrders.asc === sortOrder) return onSort(sortOrders.desc);
    return onSort(sortOrders.none);
  };

  return (
    <th className={cn(s.headCell, className)} onClick={onClick}>
      <div className="flex items-center justify-between p-2">
        <div>{children}</div>
        <div className="flex items-center">
          {filterable && <i className={cn('fa fa-filter', s.filterIcon)}></i>}
          <img src={sortOrderIconSrcs[sortOrder]} className={s.sortIcon} />
        </div>
      </div>
    </th>
  );
};
