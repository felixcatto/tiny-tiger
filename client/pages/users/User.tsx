import useSWR from 'swr';
import { Link, useRoute } from 'wouter';
import { IUser } from '../../../lib/types.js';
import Layout from '../../common/layout.jsx';
import { Spinner, getUrl, loadable, prefetchRoutes, routes } from '../../lib/utils.jsx';

export const User = () => {
  const [_, params] = useRoute(routes.user);
  const userId = params!.id;
  const route = prefetchRoutes[routes.user];

  const { data, isLoading } = useSWR<IUser>(route.getSwrRequestKey!({ id: userId }));

  return (
    <Layout>
      <div className="mb-3 flex items-center">
        <div>userId: {userId}</div>
        <Link href={getUrl('users')} className="btn btn_sm ml-3">
          Back
        </Link>
      </div>

      {!data && isLoading && <div className="spinner"></div>}

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

      {data && (
        <div className="text-center mt-3">
          <InfoCircle entityMaxValue={5} entityValue={(data.id + 5) % 7} />
        </div>
      )}
    </Layout>
  );
};

const InfoCircle = loadable(() => import('./UI/InfoCircle.jsx'), {
  fallback: <Spinner />,
});
