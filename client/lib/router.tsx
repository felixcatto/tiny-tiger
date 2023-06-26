import { match } from 'path-to-regexp';
import React from 'react';
import invariant from 'tiny-invariant';
import { createStore, useStore } from 'zustand';
import { asyncStates, getGenericDataRoute, isBrowser, qs } from '../../server/lib/routerUtils.js';
import {
  IGetRouterState,
  IRoute,
  IRouterProps,
  ISetRouterState,
  IUseRouter,
} from './routerTypes.js';

export const Router = (props: IRouterProps) => {
  const { routeData: initialRouteData, fetchRouteData, dataRoutes, children } = props;

  if (isBrowser()) {
    invariant(fetchRouteData, 'fetchRouteData is required on Client side');
  } else {
    invariant(props.pathname, 'pathname is required on Server side');
  }

  const initialPathname = isBrowser() ? window.location.pathname : props.pathname;
  const initialQuery = isBrowser() ? qs.parse(window.location.search.slice(1)) : props.query || {};

  const routerStore = createStore<any>((set: ISetRouterState, _: IGetRouterState) => ({
    setRouterState: set,

    refreshRouteData: async () => {
      const { pathname, search } = window.location;
      const url = `${pathname}${search}`;
      const newRouteData = await fetchRouteData!(url);
      set({ routeData: newRouteData });
    },

    navigate: async url => {
      const pathname = qs.getPathname(url);
      set({ routeDataState: asyncStates.pending });

      const isDataRoute = getGenericDataRoute(url, dataRoutes);
      if (isDataRoute) {
        const newRouteData = await fetchRouteData!(url);
        if (newRouteData) set({ routeData: newRouteData });
      }

      history.pushState(null, '', url);
      set({
        routeDataState: asyncStates.resolved,
        dynamicPathname: pathname,
      });
    },

    initialPathname,
    initialQuery,

    dynamicPathname: initialPathname,
    routeData: initialRouteData,
    routeDataState: asyncStates.idle,
  }));

  React.useEffect(() => {
    const onPopstate = async () => {
      const set: ISetRouterState = routerStore.setState;
      const { pathname, search } = window.location;
      const url = `${pathname}${search}`;

      const isDataRoute = getGenericDataRoute(url, dataRoutes);
      if (isDataRoute) {
        const newRouteData = await fetchRouteData!(url);
        if (newRouteData) set({ routeData: newRouteData });
      }

      set({ dynamicPathname: pathname });
    };

    addEventListener('popstate', onPopstate);
    return () => removeEventListener('popstate', onPopstate);
  }, []);

  return <RouterContext.Provider value={routerStore}>{children}</RouterContext.Provider>;
};

export const Switch = ({ children }) => {
  const dynamicPathname = useRouter(s => s.dynamicPathname);
  const routeData = useRouter(s => s.routeData);

  const ComponentToRender = children.find(component =>
    match(component.props.path)(dynamicPathname)
  );

  return React.cloneElement(ComponentToRender, { shouldRender: true, routeData });
};

export const Route = React.memo((props: IRoute) => {
  const { component, shouldRender } = props;
  const componentProps = { ...props.routeData };
  return shouldRender ? React.createElement(component, componentProps) : null;
});

export const Link = ({ href, children, ...restProps }) => {
  const navigate = useRouter(s => s.navigate);
  const onClick = () => navigate(href);

  return (
    <div {...restProps} onClick={onClick}>
      {children}
    </div>
  );
};

const RouterContext = React.createContext(null as any);

export const useRouter: IUseRouter = (selector: any) => {
  const routerStore = React.useContext(RouterContext);
  return useStore(routerStore, selector);
};

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
