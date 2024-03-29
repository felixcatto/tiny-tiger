import { Notifications, popoverRootId } from '@felixcatto/ui';
import cn from 'classnames';
import { session } from '../globalStore/store.js';
import { useRouter } from '../lib/router.jsx';
import {
  Link,
  NavLink,
  Spinner,
  useContext,
  useSetGlobalState,
  useStore,
  userRolesToIcons,
} from '../lib/utils.js';
import { asyncStates, getApiUrl, getUrl } from '../lib/utils.jsx';
import s from './Layout.module.css';

const Layout = ({ children }: any) => {
  const routeDataState = useRouter(s => s.routeDataState);
  const { axios } = useContext();
  const setGlobalState = useSetGlobalState();
  const { currentUser, isSignedIn } = useStore(session);

  const signOut = async () => {
    const user = await axios.delete(getApiUrl('session'));
    setGlobalState({ currentUser: user });
  };

  const userIconClass = role => cn(s.userRoleIcon, 'mr-1', userRolesToIcons[role]);

  return (
    <div className={s.app}>
      <div className={s.header}>
        <div className={cn('container relative', s.headerFg)}>
          <Spinner
            wrapperClass={s.spinnerWrapper}
            spinnerClass={s.spinner}
            isVisible={routeDataState === asyncStates.pending}
          />
          <div className="flex items-center">
            <img src="/img/tiger3.webp" className={cn('mr-7', s.logo)} />
            <div className="flex">
              <NavLink href={getUrl('home')}>Todolist</NavLink>
              <NavLink href={getUrl('users')}>Users</NavLink>
              <NavLink href={getUrl('projectStructure')}>Structure</NavLink>
            </div>
          </div>
          {isSignedIn ? (
            <div className="flex items-center">
              <div className="flex items-center mr-1">
                <i className={userIconClass(currentUser.role)}></i>
                <div>{currentUser.name}</div>
              </div>
              <i
                className={cn('fa fa-sign-out-alt', s.signIcon)}
                title="Sign out"
                onClick={signOut}
              ></i>
            </div>
          ) : (
            <Link href={getUrl('newSession')} className={s.signIn}>
              <div className={s.signInText}>Sign In</div>
              <i className={cn('fa fa-sign-in-alt', s.signIcon)} title="Sign in"></i>
            </Link>
          )}
        </div>
      </div>
      <div className={cn('container', s.content)}>{children}</div>
      <div id={popoverRootId}></div>
      <Notifications />
    </div>
  );
};

export default Layout;
