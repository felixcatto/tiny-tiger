import cn from 'classnames';
import { Form, Formik } from 'formik';
import React from 'react';
import useSWR from 'swr';
import {
  IGetTodosResponse,
  IHeaderCellProps,
  IMixedOnFilter,
  ISortOrder,
  ITodo,
} from '../../lib/types.js';
import Layout from '../common/layout.js';
import { HeaderCell } from '../components/HeaderCell.js';
import { Pagination } from '../components/Pagination.js';
import {
  ErrorMessage,
  Field,
  filterTypes,
  getApiUrl,
  sortOrders,
  SubmitBtn,
  useContext,
  useImmerState,
  WithApiErrors,
} from '../lib/utils.js';
import s from './styles.module.css';

type IFilters = Map<
  string,
  {
    filterBy: string;
    filterType: any;
    filter: any;
  }
>;

type IState = {
  editingTodo: ITodo | null;
  page: number;
  size: number;
  sortBy: string | null;
  sortOrder: ISortOrder;
  filters: IFilters;
};

const defaultFilters = new Map();
defaultFilters.set('name', {
  filterBy: 'name',
  filterType: filterTypes.search,
  filter: '',
});
defaultFilters.set('text', {
  filterBy: 'text',
  filterType: filterTypes.search,
  filter: '',
});
defaultFilters.set('status', {
  filterBy: 'status',
  filterType: filterTypes.select,
  filter: [],
});

const TodoList = WithApiErrors(() => {
  const onSubmit = () => {};
  const { axios } = useContext();
  const { data, mutate } = useSWR<IGetTodosResponse>(getApiUrl('todos'));
  const todos = data?.rows;

  const [state, setState] = useImmerState<IState>({
    editingTodo: null,
    page: 0,
    size: 3,
    sortBy: null,
    sortOrder: sortOrders.none,
    filters: defaultFilters,
  });
  const { editingTodo, page, size, sortBy, sortOrder, filters } = state;

  const initialValues = editingTodo
    ? { name: editingTodo.author?.name, email: editingTodo.author?.email, text: editingTodo.text }
    : { name: '', email: '', text: '' };

  // console.log(todos);
  console.log(Array.from(filters.values()));

  const editTodo = todo => async () => {
    setState({ editingTodo: todo });
  };
  const changeTodoStatus = todo => async () => {
    await axios.put(getApiUrl('todo', { id: todo.id }), {
      ...todo,
      is_completed: !todo.is_completed,
    });
    mutate();
  };
  const cancelEdit = () => {
    setState({ editingTodo: null });
  };
  const deleteTodo = id => async () => {
    await axios.delete(getApiUrl('todo', { id }));
    mutate();
  };

  const onPageChange = newPage => setState({ page: newPage - 1 });
  const onSizeChange = newSize => setState({ size: newSize, page: 0 });

  const onSortChange: IHeaderCellProps['onSort'] = (sortOrder, sortBy) => {
    setState({ sortBy, sortOrder });
  };

  const onFilterChange: IMixedOnFilter = (filter, filterBy) => {
    const filterOpts = filters.get(filterBy)!;
    filters.set(filterBy, { ...filterOpts, filter });
    setState({ filters });
  };

  const todoClass = todo =>
    cn('fa', {
      'fa-check': todo.is_completed,
      'fa-dove': !todo.is_completed,
    });
  const changeStatusIconClass = todo =>
    cn('fa fa_big mr-3 clickable', {
      'fa-check': !todo.is_completed,
      'fa-dove': todo.is_completed,
    });
  const changeStatusIconTitle = todo =>
    todo.is_completed ? 'Mark as Incomplete' : 'Mark as Completed';
  const todoRowClass = todo => cn({ [s.todoRow_completed]: todo.is_completed });

  return (
    <Layout>
      <div className="row">
        <div className="col-3">
          <Formik key={editingTodo?.id ?? '?'} initialValues={initialValues} onSubmit={onSubmit}>
            <Form>
              <div className="flex mb-4 items-center">
                {editingTodo ? (
                  <>
                    <h3 className="mb-0">Edit todo</h3>
                    <i className="fa fa-pen ml-4 text-xl text-secondary"></i>
                  </>
                ) : (
                  <h3 className="mb-0">Add new todo</h3>
                )}
              </div>
              <div className="mb-4">
                <label className="text-sm">Name</label>
                <Field className="input" name="name" />
                <ErrorMessage name="name" />
              </div>
              <div className="mb-4">
                <label className="text-sm">Email</label>
                <Field className="input" name="email" />
                <ErrorMessage name="email" />
              </div>
              <div className="mb-6">
                <label className="text-sm">Text</label>
                <Field className="input" name="text" as="textarea" />
                <ErrorMessage name="text" />
              </div>
              {editingTodo && (
                <div className="link mr-3" onClick={cancelEdit}>
                  Cancel
                </div>
              )}
              <SubmitBtn className="btn btn_primary">{editingTodo ? 'Edit' : 'Add'}</SubmitBtn>
            </Form>
          </Formik>
        </div>

        <div className="col-9">
          <h3 className="mb-4">List of todos</h3>

          <table>
            <thead>
              <tr>
                <HeaderCell
                  name="name"
                  sortOrder={sortBy === 'name' ? sortOrder : sortOrders.none}
                  onSort={onSortChange}
                  filterType={filters.get('name')!.filterType}
                  filter={filters.get('name')!.filter}
                  onFilter={onFilterChange}
                >
                  <div>Name</div>
                </HeaderCell>
                <HeaderCell
                  name="email"
                  sortOrder={sortBy === 'email' ? sortOrder : sortOrders.none}
                  onSort={onSortChange}
                >
                  <div>Email</div>
                </HeaderCell>
                <HeaderCell
                  name="text"
                  sortOrder={sortBy === 'text' ? sortOrder : sortOrders.none}
                  onSort={onSortChange}
                  filterType={filters.get('text')!.filterType}
                  filter={filters.get('text')!.filter}
                  onFilter={onFilterChange}
                >
                  <div>Text</div>
                </HeaderCell>
                <HeaderCell
                  name="status"
                  className="w-32"
                  sortOrder={sortBy === 'status' ? sortOrder : sortOrders.none}
                  onSort={onSortChange}
                  filterType={filters.get('status')!.filterType}
                  filter={filters.get('status')!.filter}
                  onFilter={onFilterChange}
                  selectFilterOptions={[
                    { label: 'Completed', value: true },
                    { label: 'Incomplete', value: false },
                  ]}
                >
                  <div>Status</div>
                </HeaderCell>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {todos?.map(todo => (
                <tr key={todo.id} className={todoRowClass(todo)}>
                  <td>{todo.author?.name}</td>
                  <td>{todo.author?.email}</td>
                  <td>{todo.text}</td>
                  <td>
                    <i
                      className={todoClass(todo)}
                      title={todo.is_completed ? 'Completed' : 'Incomplete'}
                    ></i>
                    {todo.is_edited_by_admin && (
                      <i className="fa fa-pen ml-2" title="Edited by admin"></i>
                    )}
                  </td>
                  <td className="text-right">
                    <i
                      className={changeStatusIconClass(todo)}
                      title={changeStatusIconTitle(todo)}
                      onClick={changeTodoStatus(todo)}
                    ></i>
                    <i
                      className="fa fa-edit fa_big mr-3 clickable"
                      title="Edit"
                      onClick={editTodo(todo)}
                    ></i>
                    <i
                      className="far fa-trash-can fa_big clickable"
                      title="Delete"
                      onClick={deleteTodo(todo.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.rows && (
            <Pagination
              className="mt-3"
              page={page + 1}
              size={size}
              totalRows={data.rows.length}
              onPageChange={onPageChange}
              onSizeChange={onSizeChange}
            />
          )}
        </div>
      </div>
    </Layout>
  );
});

export default TodoList;
