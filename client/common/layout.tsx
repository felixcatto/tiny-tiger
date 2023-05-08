import cn from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'wouter';
import {
  getApiUrl,
  getUrl,
  NavLink,
  popoverRootId,
  useContext,
  userRolesToIcons,
} from '../lib/utils.js';
import { selectSession } from '../redux/reducers.js';
import { Notifications } from '../ui/Notifications.jsx';
import { css } from '@emotion/react';

const Layout = ({ children }: any) => {
  const { actions, axios } = useContext();
  const { currentUser, isSignedIn } = useSelector(selectSession);

  const signOut = async () => {
    const user = await axios.delete(getApiUrl('session'));
    actions.signOut(user);
  };

  return (
    <div css={s.app}>
      <div css={s.header}>
        <div css={s.headerFg} className="container">
          <div className="flex items-center">
            <img src="/img/tiger3.webp" css={s.logo} className="mr-7" />
            <div className="flex">
              <NavLink to={getUrl('home')}>Todolist</NavLink>
              <NavLink to={getUrl('users')}>Users</NavLink>
            </div>
          </div>
          {isSignedIn ? (
            <div className="flex items-center">
              <div className="flex items-center mr-1">
                <i className={cn('mr-1 text-white', userRolesToIcons[currentUser.role])}></i>
                <div>{currentUser.name}</div>
              </div>
              <i
                css={s.signIcon}
                className="fa fa-sign-out-alt"
                title="Sign out"
                onClick={signOut}
              ></i>
            </div>
          ) : (
            <Link to={getUrl('newSession')} css={s.signIn}>
              <div className="signInText">Sign In</div>
              <i css={s.signIcon} className="fa fa-sign-in-alt" title="Sign in"></i>
            </Link>
          )}
        </div>
      </div>
      <div css={s.content} className="container">
        {children}
      </div>
      <div id={popoverRootId}></div>
      <Notifications />
    </div>
  );
};

const s = {
  app: css`
    height: 100%;
    display: grid;
    grid-template-areas:
      'header'
      'content';
    grid-template-rows: var(--headerHeight) 1fr;
  `,

  header: css`
    grid-area: header;
    position: relative;
    background: var(--primary);
    box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.5);
  `,

  headerFg: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    color: #fff;
  `,

  logo: css`
    height: 50px;
    transform: scale(1.2);
  `,

  signIn: css`
    display: flex;
    align-items: center;
    color: #fff;
    text-decoration: none;
    &:hover {
      color: #fff;
      text-decoration: none;
    }
    &:hover .signInText {
      text-decoration: underline;
    }
  `,

  signIcon: css`
    margin-right: -10px;
    padding: 4px 10px;
    color: #fff;
    cursor: pointer;
    text-decoration: none;
  `,

  content: css`
    grid-area: content;
    padding-top: var(--content-py);
    padding-bottom: var(--content-py);
    background: #fff;
    box-shadow: inset 12px 0 25px -15px rgba(0, 0, 0, 0.9),
      inset -12px 0 25px -15px rgba(0, 0, 0, 0.9);
  `,
};

export default Layout;
