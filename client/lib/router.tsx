import cn from 'classnames';
import { omit } from 'lodash-es';
import { match } from 'path-to-regexp';
import React from 'react';
import {
  asyncStates,
  getApiUrl,
  getGenericRouteByHref,
  isBrowser,
  qs,
} from '../../lib/sharedUtils.js';
import { IAsyncState, IRoute, IUseRouter } from '../../lib/types.js';
import { RouterContext } from '../lib/context.jsx';
import { useContext } from '../lib/utils.jsx';

export const useRouter = () => React.useContext<IUseRouter>(RouterContext);

export const Switch = ({ children }) => {
  const { axios, initialLoaderData, initialPathname } = useContext();
  const [dynamicPathname, setDynamicPathname] = React.useState(initialPathname);
  const [loaderData, setLoaderData] = React.useState(initialLoaderData);
  const [loaderDataState, setLoaderDataState] = React.useState<IAsyncState>(asyncStates.idle);

  const ComponentToRender = children.find(component =>
    match(component.props.path)(dynamicPathname)
  );

  const fetchLoaderData = async href => {
    const isRouteWithLoader = getGenericRouteByHref(qs.getPathname(href));
    if (isRouteWithLoader) return axios.get(getApiUrl('loaderData', {}, { url: href }));
  };

  React.useEffect(() => {
    const onPopstate = async () => {
      const { pathname, search } = window.location;
      const href = `${pathname}${search}`;

      const newLoaderData = await fetchLoaderData(href);
      if (newLoaderData) setLoaderData(newLoaderData);

      setDynamicPathname(pathname);
    };

    addEventListener('popstate', onPopstate);
    return () => removeEventListener('popstate', onPopstate);
  }, []);

  const routerStore = {
    refreshLoaderData: async () => {
      const { pathname, search } = window.location;
      const url = `${pathname}${search}`;
      const newLoaderData = await axios.get(getApiUrl('loaderData', {}, { url }));
      setLoaderData(newLoaderData);
    },

    navigate: async href => {
      const pathname = qs.getPathname(href);
      setLoaderDataState(asyncStates.pending);
      const newLoaderData = await fetchLoaderData(href);
      if (newLoaderData) setLoaderData(newLoaderData);

      history.pushState(null, '', href);
      setLoaderDataState(asyncStates.resolved);
      setDynamicPathname(pathname);
    },

    loaderDataState,
  };

  return (
    <RouterContext.Provider value={routerStore}>
      {React.cloneElement(ComponentToRender, { shouldRender: true, ...loaderData })}
    </RouterContext.Provider>
  );
};

export const Route = (props: IRoute) => {
  const { component, shouldRender } = props;
  const loaderData = omit(props, ['path', 'component', 'shouldRender']);
  return shouldRender ? React.createElement(component, loaderData) : null;
};

export const useRoute = () => {
  const { initialQuery, initialPathname } = useContext();
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
  const { navigate } = useRouter();
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
