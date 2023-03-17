import cn from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'wouter';
import {
  getUrl,
  NavLink,
  removePersistedUser,
  useContext,
  userRolesToIcons,
} from '../lib/utils.js';
import s from './layout.module.css';
import { selectSession } from '../lib/reduxReducers.js';

const Layout = ({ children }: any) => {
  const { actions } = useContext();
  const { currentUser, isSignedIn } = useSelector(selectSession);
  const onSignOut = async () => {
    await actions.signOut();
    removePersistedUser();
  };

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
                onClick={onSignOut}
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
