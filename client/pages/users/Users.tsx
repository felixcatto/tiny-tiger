import { IFiltersMap, IGqlResponse } from '../../../lib/types.js';
import Layout from '../../common/layout.js';
import { QueryGetUsersArgs } from '../../gqlTypes/graphql.js';
import { getUsers } from '../../lib/graphql.js';
import { filterTypes, roles, useGql, useTable, userRolesToIcons } from '../../lib/utils.js';
import { HeaderCell } from '../../ui/HeaderCell.js';
import { Pagination } from '../../ui/Pagination.js';

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

export const Users = () => {
  // const { data } = useSWR<IUser[]>(getApiUrl('users'));
  const { data } = useGql<IGqlResponse<'getUsers'>, QueryGetUsersArgs>(getUsers, {
    withTodos: true,
  });

  const { rows, totalRows, paginationProps, headerCellProps } = useTable({
    rows: data?.getUsers || [],
    page: 0,
    size: 10,
    sortBy: null,
    sortOrder: null,
    filters: defaultFilters,
  });

  return (
    <Layout>
      <h3 className="mb-4 select-none">List of users</h3>

      <table className="table-fixed">
        <thead>
          <tr>
            <HeaderCell {...headerCellProps} name="name" className="w-5/12" sortable>
              <div>Name</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="email" className="w-5/12" sortable>
              <div>Email</div>
            </HeaderCell>
            <HeaderCell {...headerCellProps} name="role" className="w-2/12" sortable>
              <div>Role</div>
            </HeaderCell>
          </tr>
        </thead>
        <tbody>
          {rows.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className="flex items-center">
                <div className="w-6">
                  <i className={userRolesToIcons[user.role]}></i>
                </div>
                <div>{user.role}</div>
              </td>
            </tr>
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
