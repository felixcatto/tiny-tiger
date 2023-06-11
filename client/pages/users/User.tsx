import { getUrl } from '../../../lib/sharedUtils.js';
import Layout from '../../common/layout.jsx';
import { Link, Spinner, loadable, useLoaderData } from '../../lib/utils.jsx';

export const User = () => {
  const props = useLoaderData();
  console.log(props);
  const { user } = props;

  return (
    <Layout>
      <div className="mb-3 flex items-center">
        <div>userId: {user.id}</div>
        <Link href={getUrl('users')} className="btn btn_sm ml-3" shouldOverrideClass>
          Back
        </Link>
      </div>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <div className="text-center mt-3">
        <InfoCircle entityMaxValue={5} entityValue={(user.id + 5) % 7} />
      </div>
    </Layout>
  );
};

const InfoCircle = loadable(() => import('./UI/InfoCircle.jsx'), {
  fallback: <Spinner />,
});
