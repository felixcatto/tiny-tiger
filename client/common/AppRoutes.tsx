import { Route, Switch } from 'wouter';
import { routes } from '../../lib/sharedUtils.js';
import { ProjectStructureAsync } from '../pages/projectStructure/ProjectStructureAsync.jsx';
import Login from '../pages/session/Login.jsx';
import Todolist from '../pages/todoList/Todolist.jsx';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.jsx';

export const AppRoutes = () => (
  <Switch>
    <Route path={routes.home} component={Todolist} />
    <Route path={routes.newSession} component={Login} />
    <Route path={routes.users} component={Users} />
    <Route path={routes.user} component={User} />
    <Route path={routes.projectStructure} component={ProjectStructureAsync} />
  </Switch>
);
