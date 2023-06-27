import { useForm } from 'react-hook-form';
import { IUser, IUserLoginCreds } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import { useRouter } from '../../lib/router.jsx';
import { ErrorMessage, Link, onRHFSubmit, useContext, useSetGlobalState } from '../../lib/utils.js';
import { getApiUrl, getUrl } from '../../lib/utils.jsx';

export const NewSession = () => {
  const { axios } = useContext();
  const setGlobalState = useSetGlobalState();
  const navigate = useRouter(s => s.navigate);

  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues: { name: '', password: '' },
  });
  const { isSubmitting, errors } = formState;

  const onSubmit = onRHFSubmit(
    async (userCreds: IUserLoginCreds) => {
      const user = await axios.post<IUser>(getApiUrl('session'), userCreds);
      setGlobalState({ currentUser: user });
      navigate(getUrl('home'));
    },
    { setError }
  );

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="text-sm">Login</label>
              <input className="input" {...register('name')} />
              <ErrorMessage error={errors.name} />
            </div>
            <div className="mb-4">
              <label className="text-sm">Password</label>
              <input className="input" type="password" {...register('password')} />
              <ErrorMessage error={errors.password} />
            </div>

            <div>
              <Link href={getUrl('home')} className="mr-3">
                Cancel
              </Link>
              <button type="submit" className="btn" disabled={isSubmitting}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
