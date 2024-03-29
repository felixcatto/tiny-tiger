import rawLoadable from '@loadable/component';
import { AxiosError } from 'axios';
import cn from 'classnames';
import { Variables, request } from 'graphql-request';
import produce from 'immer';
import { get, isArray, isEmpty, isFunction, isNumber, keyBy, orderBy } from 'lodash-es';
import React from 'react';
import { createPortal } from 'react-dom';
import stringMath from 'string-math';
import useSWR from 'swr';
import { useStore as useStoreRaw } from 'zustand';
import { filterTypes, makeEnum, roles } from '../../server/lib/sharedUtils.js';
import {
  IClientFSPSchema,
  IContext,
  IEncodeFSPOpts,
  IFSPSchema,
  IFilter,
  ILoadable,
  IMixedFilter,
  IOnRHFSubmit,
  ISelectFilterObj,
  ISpinnerProps,
  IUseMergeState,
  IUseSelectedRows,
  IUseStore,
  IUseTable,
  IUseTableState,
} from '../../server/lib/types.js';
import { Context } from './context.js';
import { Link as RawLink, useRoute } from './router.jsx';

export * from '../../server/lib/sharedUtils.js';

export const Spinner = (props: ISpinnerProps) => {
  const { wrapperClass = '', spinnerClass = '', isVisible = true } = props;
  const computedWrapperClass = cn(
    'flex items-center justify-center transition-opacity duration-300 delay-500',
    wrapperClass,
    { 'opacity-0': !isVisible, 'opacity-1': isVisible }
  );

  return (
    <div className={computedWrapperClass}>
      <div className={cn('spinner', spinnerClass)}></div>
    </div>
  );
};

export const SpinnerAtMiddleScreen = () => (
  <Spinner wrapperClass="h-full" spinnerClass="spinner_md" />
);

export const useContext = () => React.useContext<IContext>(Context);

export const useMergeState: IUseMergeState = initialState => {
  const [state, setState] = React.useState(initialState);

  const setImmerState = React.useCallback(fnOrObject => {
    if (isFunction(fnOrObject)) {
      const fn = fnOrObject;
      setState(curState => {
        const newState = fn(curState);
        return { ...curState, ...newState };
      });
    } else {
      const newState = fnOrObject;
      setState(curState => ({ ...curState, ...newState }));
    }
  }, []);

  return [state, setImmerState];
};

export const userRolesToIcons = {
  [roles.admin]: 'fa fa-star',
  [roles.user]: 'fa fa-fire',
  [roles.guest]: 'fa fa-ghost',
};

const getAxiosErrorData = (axiosError: AxiosError): any => axiosError.response?.data || {};

const getGqlErrorData = gqlError => gqlError.response?.errors?.[0].extensions || {};

export const setFormValues = (setValue, formValues) => {
  Object.keys(formValues).forEach(field => {
    setValue(field, formValues[field]);
  });
};

export const onRHFSubmit: IOnRHFSubmit = (onSubmit, actions) => {
  const wrappedSubmit = async values => {
    try {
      await onSubmit(values, actions);
    } catch (e) {
      const { setError } = actions;
      const setErrors = errors => {
        Object.keys(errors).forEach(fieldName => {
          setError(fieldName, { message: errors[fieldName] });
        });
      };

      const { errors } = getAxiosErrorData(e);
      const { errors: gqlErrors } = getGqlErrorData(e);

      if (errors) {
        setErrors(errors);
      } else if (gqlErrors) {
        setErrors(gqlErrors);
      } else {
        throw e;
      }
    }
  };

  return wrappedSubmit;
};

export const ErrorMessage = ({ error }) =>
  error ? <div className="error">{error.message}</div> : null;

export const popoverRootId = 'popoverRoot';

export const Portal = ({ children, selector }) => {
  const ref: any = React.useRef();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  return mounted ? createPortal(children, ref.current) : null;
};

export const Link = ({ href, children, className = 'link', shouldOverrideClass = false }) => {
  const linkClass = shouldOverrideClass ? className : cn('link', className);

  return (
    <RawLink className={linkClass} href={href}>
      {children}
    </RawLink>
  );
};

export const NavLink = ({ href, children }) => {
  const { pathname } = useRoute();
  const className = cn('nav-link', {
    'nav-link_active':
      (href !== '/' && pathname.startsWith(href)) || (href === '/' && pathname === '/'),
  });

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

export const makeCaseInsensitiveRegex = str =>
  new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

export const useTable: IUseTable = props => {
  const { rows: originalRows } = props;

  const [state, setState] = useMergeState<IUseTableState>({
    page: props.page,
    size: props.size,
    sortBy: props.sortBy,
    sortOrder: props.sortOrder,
    filters: props.filters,
  });
  const { page, size, sortBy, sortOrder, filters } = state;

  const filtersList = React.useMemo(() => (filters ? Object.values(filters) : []), [filters]);

  const onPageChange = newPage => setState({ page: newPage });
  const onSizeChange = newSize => setState({ size: newSize, page: 0 });
  const onSortChange = (sortOrder, sortBy) => setState({ sortBy, sortOrder });

  const onFilterChange = (filter: IMixedFilter, filterBy) => {
    if (!filters) return;
    setState({
      filters: produce(filters, draft => {
        draft[filterBy].filter = filter;
      }),
      page: 0,
    });
  };

  const { rows, totalRows } = React.useMemo(() => {
    if (!originalRows) return { rows: [], totalRows: 0 };

    let filtered;

    if (isEmpty(filtersList)) {
      filtered = originalRows;
    } else {
      filtered = originalRows.filter(row =>
        filtersList.every(filterObj => {
          const { filter, filterBy, filterType, customFilterFn } = filterObj;
          if (isEmpty(filter)) return true;

          const rowValueOfField = get(row, filterBy);
          if (customFilterFn) {
            return customFilterFn(rowValueOfField, filter);
          }

          if (filterType === filterTypes.search) {
            const regex = makeCaseInsensitiveRegex(filter);
            return rowValueOfField.match(regex);
          }

          if (filterType === filterTypes.select) {
            return filter.some(selectFilter => selectFilter.value === rowValueOfField);
          }
        })
      );
    }

    const sorted = sortBy && sortOrder ? orderBy(filtered, sortBy, sortOrder) : filtered;

    const paginated =
      size && isNumber(page) ? sorted.slice(page * size, page * size + size) : sorted;

    return { rows: paginated, totalRows: sorted.length };
  }, [originalRows, page, size, sortBy, sortOrder, filters]);

  const paginationProps = { totalRows, page, size, onPageChange, onSizeChange };
  const headerCellProps = { sortBy, sortOrder, filters, onSortChange, onFilterChange };

  return {
    rows,
    totalRows,
    page: page as any,
    size: size as any,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    filters: filters as any,
    paginationProps,
    headerCellProps,
  };
};

export const useSelectedRows: IUseSelectedRows = props => {
  const { rows, defaultSelectedRows = {}, rowKey = 'id' } = props;
  const [selectedRows, setSelectedRows] = React.useState(defaultSelectedRows);

  const selectedRowsState = React.useMemo(() => {
    if (isEmpty(selectedRows)) return selectedRowsStates.none;
    if (Object.keys(selectedRows).length === rows.length) return selectedRowsStates.all;
    return selectedRowsStates.partially;
  }, [rows, selectedRows]);

  const isRowSelected = row => (selectedRows[row[rowKey]] ? true : false);

  const onSelectAllRows = () => {
    if (selectedRowsState === selectedRowsStates.all) {
      setSelectedRows({});
    } else {
      setSelectedRows(keyBy(rows, rowKey));
    }
  };

  const onSelectRow = row => () => {
    const rowId = row[rowKey];
    if (isRowSelected(row)) {
      delete selectedRows[rowId];
      setSelectedRows({ ...selectedRows });
    } else {
      selectedRows[rowId] = row;
      setSelectedRows({ ...selectedRows });
    }
  };

  const selectAllRowsCheckboxProps = {
    onChange: onSelectAllRows,
    checked: selectedRowsState === selectedRowsStates.all,
    partiallyChecked: selectedRowsState === selectedRowsStates.partially,
  };

  return { selectedRows, setSelectedRows, isRowSelected, onSelectRow, selectAllRowsCheckboxProps };
};

export const stripEmptyFilters = (filters: IFilter[]) =>
  filters.filter(el => isNumber(el.filter) || !isEmpty(el.filter));

export const transformFiltersForApi = (filters: IFilter[]) => {
  const tmpFilters = stripEmptyFilters(filters);
  return tmpFilters.map(el =>
    el.filterType === filterTypes.search
      ? { filterBy: el.filterBy, filter: el.filter }
      : { filterBy: el.filterBy, filter: el.filter.map(selectOption => selectOption.value) }
  );
};

export const encodeFSPOpts: IEncodeFSPOpts = props => {
  const { filters, page, size, sortBy, sortOrder } = props;
  const filtersList = Object.values(filters);
  const query = {};

  const filtersForApi = transformFiltersForApi(filtersList);
  if (!isEmpty(filtersForApi)) {
    query['filters'] = JSON.stringify(filtersForApi);
  }

  if (size && isNumber(page)) {
    query['size'] = size;
    query['page'] = page;
  }

  if (sortBy && sortOrder) {
    query['sortBy'] = sortBy;
    query['sortOrder'] = sortOrder;
  }

  return query;
};

export const decodeFSPOpts = (querySchema, query, defaultFSPOpts): IClientFSPSchema => {
  const castedQuery = querySchema.cast(query, {
    stripUnknown: true,
  }) as IFSPSchema;
  if (isEmpty(castedQuery)) return defaultFSPOpts;

  if (isEmpty(castedQuery.filters)) return { ...defaultFSPOpts, ...castedQuery };

  const tableFilters = produce(defaultFSPOpts.filters, draft => {
    castedQuery.filters!.forEach(filterObj => {
      const filterItem = draft[filterObj.filterBy];

      if (isArray(filterObj.filter)) {
        const newFilter = filterObj.filter.map(filterValue =>
          (filterItem as ISelectFilterObj).filterOptions.find(el => el.value === filterValue)
        );
        filterItem.filter = newFilter;
      } else {
        filterItem.filter = filterObj.filter;
      }
    });
  });

  return { ...defaultFSPOpts, ...castedQuery, filters: tableFilters };
};

export const getCssValue = (cssValue: string) =>
  stringMath(cssValue.trim().replaceAll('calc', '').replaceAll('s', ''));

export const gqlRequest = <TVariables extends Variables = any>(query, variables?: TVariables) =>
  request('/graphql', query, variables);

const fetcher: any = ({ query, variables }) => request('/graphql', query, variables);

export const useGql = <TResponse = any, TVariables = any>(query, variables?: TVariables) =>
  useSWR<TResponse>({ query, variables }, fetcher);

export const selectedRowsStates = makeEnum('all', 'none', 'partially');

export const useStore: IUseStore = selector => {
  const { globalStore } = useContext();
  return useStoreRaw(globalStore, selector);
};

export const useSetGlobalState = () => useStore(state => state.setGlobalState);

export const loadable: ILoadable =
  typeof rawLoadable === 'function' ? rawLoadable : rawLoadable.default;
