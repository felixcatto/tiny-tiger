import { AxiosError } from 'axios';
import cn from 'classnames';
import { useFormikContext } from 'formik';
import { Variables, request } from 'graphql-request';
import produce from 'immer';
import { atom, useAtom } from 'jotai';
import { get, isEmpty, isFunction, isNull, isNumber, keyBy, omit, orderBy } from 'lodash-es';
import React from 'react';
import { createPortal } from 'react-dom';
import stringMath from 'string-math';
import useSWR, { useSWRConfig } from 'swr';
import { useLocation } from 'wouter';
import {
  asyncStates,
  filterTypes,
  getPrefetchRouteByHref,
  makeEnum,
  roles,
  sortOrders,
} from '../../lib/sharedUtils.js';
import {
  IApiErrors,
  IAsyncState,
  IContext,
  IFilter,
  IGetFSPQuery,
  IMakeAsyncAtom,
  IMixedFilter,
  ISortOrder,
  IUseMergeState,
  IUseSelectedRows,
  IUseSubmit,
  IUseTable,
  IUseTableState,
} from '../../lib/types.js';
import Context from './context.js';

export * from '../../lib/sharedUtils.js';
export { Context };

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

const usePrefetch = href => {
  const { mutate, cache } = useSWRConfig();
  const { axios, prefetchRoutesStatesAtom } = useContext();
  const [prefetchRoutesStates, setPrefetchRoutesStates] = useAtom(prefetchRoutesStatesAtom);

  const prefetchRoute = getPrefetchRouteByHref(href);
  const swrRequestKey = prefetchRoute?.swrRequestKey;

  let prefetchState: IAsyncState;
  if (swrRequestKey) {
    // via SSR or by useSWR on direct load, i.e. not by Link
    const isPrefetchedBySWR = cache.get(swrRequestKey);
    if (isPrefetchedBySWR) {
      prefetchState = asyncStates.resolved;
    } else {
      prefetchState = prefetchRoutesStates[swrRequestKey] || asyncStates.idle;
    }
  } else {
    prefetchState = asyncStates.resolved;
  }

  const onMouseEnter = async () => {
    if (!swrRequestKey) return;
    if (prefetchState !== asyncStates.idle) return;

    setPrefetchRoutesStates(state => {
      state[swrRequestKey] = asyncStates.pending;
    });
    await mutate(swrRequestKey, async () => axios.get(swrRequestKey), {
      revalidate: false,
      populateCache: true,
    });
    setPrefetchRoutesStates(state => {
      state[swrRequestKey] = asyncStates.resolved;
    });
  };

  return {
    onMouseEnter,
    isRoutePrefetched: prefetchState === asyncStates.resolved,
  };
};

export const PrefetchLink = ({ href, children, className = '' }) => {
  const { onMouseEnter, isRoutePrefetched } = usePrefetch(href);
  const [_, navigate] = useLocation();

  const onClick = async () => {
    if (!isRoutePrefetched) await new Promise(resolve => setTimeout(resolve, 200));

    navigate(href);
  };

  return (
    <div className={cn('link', className)} onMouseEnter={onMouseEnter} onClick={onClick}>
      {children}
    </div>
  );
};

export const NavLink = ({ href, children }) => {
  const [pathname] = useLocation();
  const className = cn('nav-link', {
    'nav-link_active':
      (href !== '/' && pathname.startsWith(href)) || (href === '/' && pathname === '/'),
  });

  return (
    <PrefetchLink href={href} className={className}>
      {children}
    </PrefetchLink>
  );
};

export const userRolesToIcons = {
  [roles.admin]: 'fa fa-star',
  [roles.user]: 'fa fa-fire',
  [roles.guest]: 'fa fa-ghost',
};

export const FormContext = React.createContext<IApiErrors>(null as any);

export const WithApiErrors = (Component: React.ComponentType<IApiErrors>) => props => {
  const [apiErrors, setApiErrors] = React.useState({});
  return (
    <FormContext.Provider value={{ apiErrors, setApiErrors }}>
      <Component {...props} apiErrors={apiErrors} setApiErrors={setApiErrors} />
    </FormContext.Provider>
  );
};

const getAxiosErrorData = (axiosError: AxiosError): any => axiosError.response?.data || {};

const getGqlErrorData = gqlError => gqlError.response?.errors?.[0].extensions || {};

export const useSubmit: IUseSubmit = onSubmit => {
  const { setApiErrors } = React.useContext(FormContext);

  const wrappedSubmit = async (values, actions) => {
    try {
      await onSubmit(values, actions);
    } catch (e: any) {
      const { errors } = getAxiosErrorData(e);
      const { errors: gqlErrors } = getGqlErrorData(e);
      if (errors) {
        setApiErrors(errors);
      } else if (gqlErrors) {
        setApiErrors(gqlErrors);
      } else {
        throw e;
      }
    }
  };

  return wrappedSubmit;
};

export const ErrorMessage = ({ name }) => {
  const { apiErrors } = React.useContext(FormContext);
  const error = apiErrors[name];
  return error ? <div className="error">{error}</div> : null;
};

export const Field = props => {
  const { apiErrors, setApiErrors } = React.useContext(FormContext);
  const { values, handleBlur: onBlur, handleChange }: any = useFormikContext();
  const value = values[props.name];
  const { as, children, ...restProps } = props;
  const asElement = as || 'input';
  const onChange = e => {
    setApiErrors(omit(apiErrors, e.target.name));
    handleChange(e);
  };

  return React.createElement(asElement, { ...restProps, onChange, onBlur, value }, children);
};

export const SubmitBtn = ({ children, ...props }) => {
  const { isSubmitting, submitForm } = useFormikContext();
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      {...props}
      onClick={e => {
        e.preventDefault();
        submitForm(); // needed because original Formik submit suppress Error's
      }}
    >
      {children}
    </button>
  );
};

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

  const onSortChange = (sortOrder, sortBy) => {
    let newSortOrder: ISortOrder = null;
    if (isNull(sortOrder)) newSortOrder = sortOrders.asc;
    if (sortOrders.asc === sortOrder) newSortOrder = sortOrders.desc;

    setState({ sortBy, sortOrder: newSortOrder });
  };

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

export const getFSPQuery: IGetFSPQuery = props => {
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

export const getCssValue = (cssValue: string) =>
  stringMath(cssValue.trim().replaceAll('calc', '').replaceAll('s', ''));

export const gqlRequest = <TVariables extends Variables = any>(query, variables?: TVariables) =>
  request('/graphql', query, variables);

const fetcher: any = ({ query, variables }) => request('/graphql', query, variables);

export const useGql = <TResponse = any, TVariables = any>(query, variables?: TVariables) =>
  useSWR<TResponse>({ query, variables }, fetcher);

export const selectedRowsStates = makeEnum('all', 'none', 'partially');

export const makeAsyncAtom: IMakeAsyncAtom = initialData => {
  const initialState = {
    data: initialData,
    state: asyncStates.idle,
  };

  const asyncAtom = atom(initialState, async (get, set, asyncFn: any) => {
    const pendingStateData = get(asyncAtom).data;
    set(asyncAtom, {
      data: pendingStateData,
      state: asyncStates.pending,
    });

    try {
      const data = await asyncFn();
      set(asyncAtom, {
        data,
        state: asyncStates.resolved,
      });
    } catch (e) {
      set(asyncAtom, {
        data: pendingStateData,
        state: asyncStates.rejected,
        errors: e.response.data,
      });
    }
  });

  return asyncAtom;
};
