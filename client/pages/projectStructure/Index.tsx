import Layout from '../../common/Layout.jsx';
import { SpinnerAtMiddleScreen, loadable } from '../../lib/utils.jsx';

const ProjectStructure = loadable(() => import('./projectStructure.jsx'), {
  fallback: <SpinnerAtMiddleScreen />,
});

export const ProjectStructureAsync = () => (
  <Layout>
    <ProjectStructure />
  </Layout>
);
