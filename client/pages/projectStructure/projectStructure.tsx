import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const ProjectStructure = () => {
  // TODO: add ability to open in full screen
  return (
    <div>
      <TransformWrapper initialScale={1.6}>
        <TransformComponent wrapperClass="rounded cursor-move">
          <img src="/img/project-structure.svg" alt="" />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default ProjectStructure;
