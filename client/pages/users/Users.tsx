import cn from 'classnames';
import { isEmpty } from 'lodash-es';
import React from 'react';
import useSWR from 'swr';
import { IFiltersMap, IUser } from '../../../lib/types.js';
import Layout from '../../common/layout.js';
import {
  PrefetchLink,
  filterTypes,
  getUrl,
  prefetchRoutes,
  roles,
  routes,
  useSelectedRows,
  useTable,
  userRolesToIcons,
} from '../../lib/utils.js';
import { Checkbox, Expandbox } from '../../ui/Checkbox.jsx';
import { Collapse } from '../../ui/Collapse.jsx';
import { HeaderCell } from '../../ui/HeaderCell.js';
import { Pagination } from '../../ui/Pagination.js';

export const Users = () => {
  const { data } = useSWR<IUser[]>(prefetchRoutes[routes.users].swrRequestKey);
  // const { data } = useGql<IGqlResponse<'getUsers'>, QueryGetUsersArgs>(getUsers, {
  //   withTodos: true,
  // });

  const tableColCount = 5;
  const { rows, totalRows, paginationProps, headerCellProps } = useTable({
    rows: data,
    page: 0,
    size: 10,
    sortBy: null,
    sortOrder: null,
    filters: defaultFilters,
  });

  const { selectedRows, setSelectedRows, isRowSelected, onSelectRow, selectAllRowsCheckboxProps } =
    useSelectedRows({
      rows,
    });

  const { isRowSelected: isRowExpanded, onSelectRow: onExpandRow } = useSelectedRows({ rows });

  const todoClass = todo =>
    cn('fa', {
      'fa-check': todo.is_completed,
      'fa-dove': !todo.is_completed,
    });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-3">
        <h3 className="mb-4 select-none">List of users</h3>
        <div>
          <div className="btn mr-3" onClick={() => setSelectedRows({})}>
            Clear selected rows
          </div>
          <div className="btn" onClick={() => console.log(selectedRows)}>
            Show selected rows
          </div>
        </div>
      </div>

      <table className="table-fixed">
        <thead>
          <tr>
            <th className="w-5">
              <Checkbox {...selectAllRowsCheckboxProps} />
            </th>
            <th className="w-5"></th>
            <HeaderCell {...headerCellProps} name="name" className="w-5/12" sortable>
              <div>Name</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="email" className="w-4/12" sortable>
              <div>Email</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="role" className="w-2/12" sortable>
              <div>Role</div>
            </HeaderCell>
          </tr>
        </thead>
        <tbody>
          {rows.map(user => (
            <React.Fragment key={user.id}>
              <tr>
                <td>
                  <Checkbox onChange={onSelectRow(user)} checked={isRowSelected(user)} />
                </td>
                <td>
                  {!isEmpty(user.todos) && (
                    <Expandbox
                      onClick={onExpandRow(user)}
                      isExpanded={isRowExpanded(user)}
                      className="p-1"
                    />
                  )}
                </td>
                <td>
                  <PrefetchLink href={getUrl('user', { id: user.id })}>{user.name}</PrefetchLink>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="flex items-center">
                    <div className="w-6">
                      <i className={userRolesToIcons[user.role]}></i>
                    </div>
                    <div>{user.role}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={tableColCount} className="p-0 border-none">
                  <Collapse isHidden={!isRowExpanded(user)} minimumElHeight={85}>
                    <table className="table table_inner table-fixed">
                      <thead>
                        <tr>
                          <th className="w-5" colSpan={2}>
                            Todos []
                          </th>
                          <th className="w-5/12">Text</th>
                          <th className="w-4/12">Is Completed</th>
                          <th className="w-2/12">Is Edited By Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.todos?.map(todo => (
                          <tr key={todo.id}>
                            <td></td>
                            <td></td>
                            <td>{todo.text}</td>
                            <td>
                              <i
                                className={todoClass(todo)}
                                title={todo.is_completed ? 'Completed' : 'Incomplete'}
                              ></i>
                            </td>
                            <td>
                              {todo.is_edited_by_admin && (
                                <i className="fa fa-pen" title="Edited by admin"></i>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={tableColCount} className="p-0 border-none">
                            <div className="h-1.5 bg-gray-100"></div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {totalRows >= 10 && (
        <Pagination
          {...paginationProps}
          className="mt-3"
          totalRows={totalRows}
          availableSizes={[10, 25, 50]}
        />
      )}
    </Layout>
  );
};

const defaultFilters: IFiltersMap = {
  name: {
    filterBy: 'name',
    filterType: filterTypes.search,
    filter: '',
  },
  email: {
    filterBy: 'email',
    filterType: filterTypes.search,
    filter: '',
  },
  role: {
    filterBy: 'role',
    filterType: filterTypes.select,
    filter: [],
    filterOptions: [
      { label: 'Admin', value: roles.admin },
      { label: 'User', value: roles.user },
      { label: 'Guest', value: roles.guest },
    ],
  },
};
