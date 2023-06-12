import cn from 'classnames';
import { Form, Formik } from 'formik';
import produce from 'immer';
import { isArray, isEmpty, isString, isUndefined } from 'lodash-es';
import React from 'react';
import * as y from 'yup';
import {
  filterTypes,
  getApiUrl,
  getUrl,
  paginationSchema,
  sortOrders,
  yupFromJson,
} from '../../../lib/sharedUtils.js';
import { IClientFSPSchema, IFiltersMap, IMixedFilter, ITodo } from '../../../lib/types.js';
import Layout from '../../common/Layout.jsx';
import { session } from '../../globalStore/store.js';
import { useRoute, useRouter } from '../../lib/router.jsx';
import {
  ErrorMessage,
  Field,
  SubmitBtn,
  WithApiErrors,
  decodeFSPOpts,
  encodeFSPOpts,
  useContext,
  useSubmit,
} from '../../lib/utils.js';
import { HeaderCell } from '../../ui/HeaderCell.js';
import { makeNotification } from '../../ui/Notifications.jsx';
import { Pagination } from '../../ui/Pagination.js';
import s from './styles.module.css';

const TodoList = props => {
  const { rows, totalRows } = props;
  const { refreshLoaderData, navigate } = useRouter();
  const { useStore, axios } = useContext();
  const { isSignedIn } = useStore(session);
  const addNotification = useStore(state => state.addNotification);
  const { query } = useRoute();

  const FSPOpts = React.useMemo(() => decodeFSPOpts(querySchema, query, defaultFSPOpts), [query]);
  const { page, size, sortBy, sortOrder, filters } = FSPOpts;

  const onChange = async newState => {
    const query = encodeFSPOpts({ ...FSPOpts, ...newState });
    navigate(getUrl('home', {}, query));
  };

  const onSortChange = (sortOrder, sortBy) => onChange({ sortOrder, sortBy });

  const onFilterChange = (filter: IMixedFilter, filterBy) => {
    onChange({
      filters: produce(filters, draft => {
        draft[filterBy].filter = filter;
      }),
      page: 0,
    });
  };

  const paginationProps = { totalRows, page, size, onPaginationChange: onChange };
  const headerCellProps = { sortBy, sortOrder, filters, onSortChange, onFilterChange };

  const [editingTodo, setEditingTodo] = React.useState<ITodo | null>(null);

  const initialValues = editingTodo
    ? {
        name: editingTodo.author?.name,
        email: editingTodo.author?.email,
        text: editingTodo.text,
      }
    : { name: '', email: '', text: '' };

  const onSubmit = useSubmit(async (values, fmActions) => {
    if (editingTodo) {
      await axios.put(getApiUrl('todo', { id: editingTodo.id }), { text: values.text });
      addNotification(makeNotification({ title: 'Todo', text: 'Edited successfully' }));
    } else {
      await axios.post(getApiUrl('todos'), values);
      addNotification(makeNotification({ title: 'Todo', text: 'Created successfully' }));
    }
    fmActions.resetForm();
    refreshLoaderData();
    setEditingTodo(null);
  });

  const editTodo = todo => async () => {
    setEditingTodo(todo);
  };

  const changeTodoStatus = todo => async () => {
    await axios.put(getApiUrl('todo', { id: todo.id }), {
      ...todo,
      is_completed: !todo.is_completed,
    });
    refreshLoaderData();
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  const deleteTodo = id => async () => {
    await axios.delete(getApiUrl('todo', { id }));
    refreshLoaderData();
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
              {!isSignedIn && !editingTodo && (
                <>
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
                </>
              )}
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

          <table className="table table-fixed">
            <thead>
              <tr>
                <HeaderCell {...headerCellProps} name="author.name" className="w-32" sortable>
                  <div>Name</div>
                </HeaderCell>
                <HeaderCell {...headerCellProps} name="author.email" className="w-44" sortable>
                  <div>Email</div>
                </HeaderCell>
                <HeaderCell {...headerCellProps} name="text" sortable>
                  <div>Text</div>
                </HeaderCell>
                <HeaderCell {...headerCellProps} name="is_completed" className="w-32" sortable>
                  <div>Status</div>
                </HeaderCell>
                {isSignedIn && <th className="w-32"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(todo => (
                <tr key={todo.id} className={todoRowClass(todo)}>
                  <td>{todo.author?.name}</td>
                  <td className="truncate">{todo.author?.email}</td>
                  <td className="text-justify">{todo.text}</td>
                  <td>
                    <i
                      className={todoClass(todo)}
                      title={todo.is_completed ? 'Completed' : 'Incomplete'}
                    ></i>
                    {todo.is_edited_by_admin && (
                      <i className="fa fa-pen ml-2" title="Edited by admin"></i>
                    )}
                  </td>
                  {isSignedIn && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {rows && <Pagination {...paginationProps} className="mt-3" totalRows={totalRows} />}
        </div>
      </div>
    </Layout>
  );
};

const defaultFilters = {
  'author.name': {
    filterBy: 'author.name',
    filterType: filterTypes.search,
    filter: '',
  },
  text: {
    filterBy: 'text',
    filterType: filterTypes.search,
    filter: '',
  },
  is_completed: {
    filterBy: 'is_completed',
    filterType: filterTypes.select,
    filter: [],
    filterOptions: [
      { label: 'Completed', value: true },
      { label: 'Incomplete', value: false },
    ],
  },
} as IFiltersMap;

const defaultFSPOpts = {
  page: 0,
  size: 3,
  filters: defaultFilters,
} as IClientFSPSchema;

const todoFields = [
  'id',
  'text',
  'is_completed',
  'is_edited_by_admin',
  'author.name',
  'author.email',
];

const todoSortSchema = y.object({
  sortOrder: y.string().oneOf([sortOrders.asc, sortOrders.desc]),
  sortBy: y.string().oneOf(todoFields),
});

const todoFilterSchema = y.object({
  filters: y
    .array()
    .of(
      y.object({
        filterBy: y.string().oneOf(todoFields).required(),
        filter: y.mixed().test({
          message: 'filter should be non empty String or Any[]',
          test: value => {
            if (!isString(value) && !isArray(value)) return false;
            return !isEmpty(value);
          },
        }),
      })
    )
    .test({
      message: 'filters should be not empty []',
      test: value => (isArray(value) && !isEmpty(value)) || isUndefined(value),
    })
    .transform(yupFromJson),
});

const querySchema = paginationSchema.concat(todoSortSchema).concat(todoFilterSchema);

export default WithApiErrors(TodoList);
