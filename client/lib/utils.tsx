import cn from 'classnames';
import { useFormikContext } from 'formik';
import produce from 'immer';
import { get, isEmpty, isFunction, isNumber, omit, orderBy } from 'lodash-es';
import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { filterTypes, roles } from '../../lib/sharedUtils.js';
import {
  IApiErrors,
  IContext,
  IFilter,
  IUseImmerState,
  IUseQuery,
  IUser,
  IUseSubmit,
  IUseTable,
} from '../../lib/types.js';
import Context from './context.js';

export * from '../../lib/sharedUtils.js';
export { Context };

export const useContext = () => React.useContext<IContext>(Context);

export const useImmerState: IUseImmerState = initialState => {
  const [state, setState] = React.useState(initialState);

  const setImmerState = React.useCallback(fnOrObject => {
    if (isFunction(fnOrObject)) {
      const fn = fnOrObject;
      setState(curState => produce(curState, fn));
    } else {
      const newState = fnOrObject;
      setState(curState => ({ ...curState, ...newState }));
    }
  }, []);

  return [state, setImmerState];
};

export const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const className = cn('nav-link', {
    'nav-link_active': (to !== '/' && pathname.startsWith(to)) || (to === '/' && pathname === '/'),
  });
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
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

export const useSubmit: IUseSubmit = onSubmit => {
  const { setApiErrors } = React.useContext(FormContext);

  const wrappedSubmit = async (values, actions) => {
    try {
      await onSubmit(values, actions);
    } catch (e: any) {
      setApiErrors(e.errors);
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
  const { isSubmitting } = useFormikContext();
  return (
    <button type="submit" disabled={isSubmitting} {...props}>
      {children}
    </button>
  );
};

export const Portal = ({ children, selector }) => {
  const ref: any = React.useRef();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  return mounted ? createPortal(children, ref.current) : null;
};

export const localStorageUserKey = 'currentUser';
export const persistUser = (user: IUser) => {
  localStorage.setItem(localStorageUserKey, JSON.stringify(user));
};
export const removePersistedUser = () => {
  localStorage.removeItem(localStorageUserKey);
};
export const restoreUser = (): IUser | null => {
  const serializedUser = localStorage.getItem(localStorageUserKey);
  return serializedUser ? JSON.parse(serializedUser) : null;
};

export const thunk = asyncFn => async (arg, thunkAPI) => {
  try {
    const response = await asyncFn(arg, thunkAPI);
    return response;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
};

export const makeCaseInsensitiveRegex = str =>
  new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

export const useTable: IUseTable = props => {
  const { rows: originalRows, page, size, sortBy, sortOrder, filters } = props;

  return React.useMemo(() => {
    const filtersList = Array.from(filters.values());
    let filtered;

    if (isEmpty(filtersList)) {
      filtered = originalRows;
    } else {
      filtered = originalRows.filter(todo =>
        filtersList.every(filterObj => {
          if (isEmpty(filterObj.filter)) return true;

          const todoValueOfField = get(todo, filterObj.filterBy);
          if (filterObj.filterType === filterTypes.search) {
            const regex = makeCaseInsensitiveRegex(filterObj.filter);
            return todoValueOfField.match(regex);
          } else if (filterObj.filterType === filterTypes.select) {
            return filterObj.filter.some(selectFilter => selectFilter.value === todoValueOfField);
          }
        })
      );
    }

    const sorted = sortBy && sortOrder ? orderBy(filtered, sortBy, sortOrder) : filtered;

    const paginated =
      size && isNumber(page) ? sorted.slice(page * size, page * size + size) : sorted;

    return { rows: paginated, totalRows: sorted.length };
  }, [originalRows, page, size, sortBy, sortOrder, filters]);
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

export const useQuery: IUseQuery = props => {
  const { filters, page, size, sortBy, sortOrder } = props;

  return React.useMemo(() => {
    const queryStr = {};
    const filtersList = Array.from(filters.values());
    const filtersForApi = transformFiltersForApi(filtersList);
    if (!isEmpty(filtersForApi)) {
      queryStr['filters'] = JSON.stringify(filtersForApi);
    }

    if (size && isNumber(page)) {
      queryStr['size'] = size;
      queryStr['page'] = page;
    }

    if (sortBy && sortOrder) {
      queryStr['sortBy'] = sortBy;
      queryStr['sortOrder'] = sortOrder;
    }

    return queryStr;
  }, [filters, page, size, sortBy, sortOrder]);
};
