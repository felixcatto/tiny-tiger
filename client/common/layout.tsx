import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { getUrl, guestUser, NavLink, userRolesToIcons } from '../lib/utils.js';
import s from './layout.module.css';

const Layout = ({ children }: any) => {
  // const { $session, actions } = useContext();
  // const { currentUser, isSignedIn } = useStore($session);
  const actions = { signOut: () => {} };
  const currentUser = guestUser;
  const isSignedIn = false;
  const userIconClass = role => cn(s.userRoleIcon, 'mr-1', userRolesToIcons[role]);

  return (
    <div className={s.app}>
      <div className={s.header}>
        <div className={cn('container', s.headerFg)}>
          <div className="flex items-center">
            <img src="/img/tiger3.webp" className={cn('mr-7', s.logo)} />
            <div className="flex">
              <NavLink to={getUrl('home')}>Home</NavLink>
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
                onClick={() => actions.signOut()}
              ></i>
            </div>
          ) : (
            <Link to={getUrl('newSession')} className={s.signIn}>
              <div className={s.signInText}>Sign In</div>
              <i className={cn('fa fa-sign-in-alt', s.signIcon)} title="Sign in"></i>
            </Link>
          )}
        </div>
      </div>
      <div className={cn('container', s.content)}>{children}</div>
    </div>
  );
};

export default Layout;
