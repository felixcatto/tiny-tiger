import originalAxios from 'axios';
import cn from 'classnames';
import { omit } from 'lodash-es';
import { match } from 'path-to-regexp';
import React from 'react';
import { createStore, useStore } from 'zustand';
import {
  asyncStates,
  getApiUrl,
  getGenericRouteByHref,
  isBrowser,
  qs,
} from '../../lib/sharedUtils.js';
import {
  IGetRouterState,
  IRoute,
  IRouterProps,
  ISetRouterState,
  IUseRouter,
} from '../../lib/types.js';
import { RouterContext } from '../lib/context.jsx';

export const useRouter: IUseRouter = (selector: any) => {
  const routerStore = React.useContext(RouterContext);
  return useStore(routerStore, selector);
};

export const Router = (props: IRouterProps) => {
  const { loaderData: initialLoaderData, children } = props;

  const initialPathname = isBrowser() ? window.location.pathname : props.pathname;
  const initialQuery = isBrowser() ? qs.parse(window.location.search.slice(1)) : props.query;

  const axios = originalAxios.create();
  axios.interceptors.response.use(response => response.data);

  const fetchLoaderData = async href => {
    const isRouteWithLoader = getGenericRouteByHref(qs.getPathname(href));
    if (isRouteWithLoader) return axios.get(getApiUrl('loaderData', {}, { url: href }));
  };

  const routerStore = createStore<any>((set: ISetRouterState, _: IGetRouterState) => ({
    setRouterState: set,

    refreshLoaderData: async () => {
      const { pathname, search } = window.location;
      const url = `${pathname}${search}`;
      const newLoaderData = await axios.get(getApiUrl('loaderData', {}, { url }));
      set({ loaderData: newLoaderData });
    },

    navigate: async href => {
      const pathname = qs.getPathname(href);
      set({ loaderDataState: asyncStates.pending });

      const newLoaderData = await fetchLoaderData(href);
      if (newLoaderData) set({ loaderData: newLoaderData });

      history.pushState(null, '', href);
      set({
        loaderDataState: asyncStates.resolved,
        dynamicPathname: pathname,
      });
    },

    initialPathname,
    initialQuery,

    dynamicPathname: initialPathname,
    loaderData: initialLoaderData,
    loaderDataState: asyncStates.idle,
  }));

  React.useEffect(() => {
    const onPopstate = async () => {
      const set: ISetRouterState = routerStore.setState;
      const { pathname, search } = window.location;
      const href = `${pathname}${search}`;

      const newLoaderData = await fetchLoaderData(href);
      if (newLoaderData) set({ loaderData: newLoaderData });

      set({ dynamicPathname: pathname });
    };

    addEventListener('popstate', onPopstate);
    return () => removeEventListener('popstate', onPopstate);
  }, []);

  return <RouterContext.Provider value={routerStore}>{children}</RouterContext.Provider>;
};

export const Switch = ({ children }) => {
  const dynamicPathname = useRouter(s => s.dynamicPathname);
  const loaderData = useRouter(s => s.loaderData);

  const ComponentToRender = children.find(component =>
    match(component.props.path)(dynamicPathname)
  );

  return React.cloneElement(ComponentToRender, { shouldRender: true, ...loaderData });
};

export const Route = React.memo((props: IRoute) => {
  const { component, shouldRender } = props;
  const loaderData = omit(props, ['path', 'component', 'shouldRender']);
  return shouldRender ? React.createElement(component, loaderData) : null;
});

export const useRoute = () => {
  const initialPathname = useRouter(s => s.initialPathname);
  const initialQuery = useRouter(s => s.initialQuery);
  let query;
  let pathname;
  if (isBrowser()) {
    pathname = window.location.pathname;
    query = qs.parse(window.location.search.slice(1));
  } else {
    pathname = initialPathname;
    query = initialQuery;
  }

  return { pathname, query };
};

export const Link = ({ href, children, className = 'link', shouldOverrideClass = false }) => {
  const navigate = useRouter(s => s.navigate);
  const onClick = () => navigate(href);
  const linkClass = shouldOverrideClass ? className : cn('link', className);

  return (
    <div className={linkClass} onClick={onClick}>
      {children}
    </div>
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
