import cn from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { roles } from '../../lib/sharedUtils.js';
import { IApiErrors, IContext } from '../../lib/types.js';
import Context from './context.js';
import { useFormikContext } from 'formik';
import { isFunction, omit } from 'lodash-es';
import produce from 'immer';

export * from '../../lib/sharedUtils.js';
export { Context };

export const useContext = () => React.useContext<IContext>(Context);

export function useImmerState<T = any>(initialState) {
  const [state, setState] = React.useState<T>(initialState);

  const setImmerState = React.useRef(fnOrObject => {
    if (isFunction(fnOrObject)) {
      const fn = fnOrObject;
      setState(curState => produce(curState, fn));
    } else {
      const newState = fnOrObject;
      setState(curState => ({ ...curState, ...newState }));
    }
  });

  return [state, setImmerState.current] as const;
}

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
