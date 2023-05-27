import Layout from '../../common/layout.jsx';
import { SpinnerAtMiddleScreen, loadable } from '../../lib/utils.jsx';

const ProjectStructure = loadable(() => import('./ProjectStructure.jsx'), {
  fallback: <SpinnerAtMiddleScreen />,
});

export const ProjectStructureAsync = () => (
  <Layout>
    <ProjectStructure />
  </Layout>
);
