import produce from 'immer';
import React from 'react';
import useSWR from 'swr';
import { IHeaderCellProps, IMixedOnFilter, ISortOrder, IUser } from '../../lib/types.js';
import { HeaderCell } from '../components/HeaderCell.js';
import Layout from '../components/layout.js';
import { Pagination } from '../components/Pagination.js';
import {
  filterTypes,
  getApiUrl,
  roles,
  useImmerState,
  userRolesToIcons,
  useTable,
} from '../lib/utils.js';

type IFiltersMap = Record<
  string,
  {
    filterBy: string;
    filterType: any;
    filter: any;
    filterOptions?: any;
  }
>;

type IState = {
  page: number;
  size: number;
  sortBy: string | null;
  sortOrder: ISortOrder;
  filters: IFiltersMap;
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

export const Users = () => {
  const [state, setState] = useImmerState<IState>({
    page: 0,
    size: 10,
    sortBy: null,
    sortOrder: null,
    filters: defaultFilters,
  });
  const { page, size, sortBy, sortOrder, filters } = state;

  const { data } = useSWR<IUser[]>(getApiUrl('users'));
  const filtersList = React.useMemo(() => Object.values(filters), [filters]);

  const { rows, totalRows } = useTable({
    rows: data || [],
    page,
    size,
    sortBy,
    sortOrder,
    filters: filtersList,
  });

  const onPageChange = newPage => setState({ page: newPage - 1 });
  const onSizeChange = newSize => setState({ size: newSize, page: 0 });

  const onSortChange: IHeaderCellProps['onSort'] = (sortOrder, sortBy) =>
    setState({ sortBy, sortOrder });

  const onFilterChange: IMixedOnFilter = (filter, filterBy) =>
    setState({
      filters: produce(filters, draft => {
        draft[filterBy].filter = filter;
      }),
      page: 0,
    });

  return (
    <Layout>
      <h3 className="mb-4 select-none">List of users</h3>

      <table className="table-fixed">
        <thead>
          <tr>
            <HeaderCell
              name="name"
              className="w-5/12"
              sortOrder={sortBy === 'name' ? sortOrder : null}
              onSort={onSortChange}
              filterType={filters.name.filterType}
              filter={filters.name.filter}
              onFilter={onFilterChange}
            >
              <div>Name</div>
            </HeaderCell>
            <HeaderCell
              name="email"
              className="w-5/12"
              sortOrder={sortBy === 'email' ? sortOrder : null}
              onSort={onSortChange}
              filterType={filters.email.filterType}
              filter={filters.email.filter}
              onFilter={onFilterChange}
            >
              <div>Email</div>
            </HeaderCell>
            <HeaderCell
              name="role"
              className="w-2/12"
              sortOrder={sortBy === 'role' ? sortOrder : null}
              onSort={onSortChange}
              filterType={filters.role.filterType}
              filter={filters.role.filter}
              selectFilterOptions={filters.role.filterOptions}
              onFilter={onFilterChange}
            >
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

      {rows && totalRows >= 10 && (
        <Pagination
          className="mt-3"
          page={page + 1}
          size={size}
          totalRows={totalRows}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
          availableSizes={[10, 25, 50]}
        />
      )}
    </Layout>
  );
};
