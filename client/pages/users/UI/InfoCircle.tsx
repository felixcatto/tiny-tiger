// import { Progress } from 'antd';
import cn from 'classnames';
import s from './InfoCircle.module.css';

type IInfoCircleProps = {
  entityMaxValue: number;
  entityValue: number;
  className?: string;
};

const InfoCircle = (props: IInfoCircleProps) => {
  const { entityMaxValue, entityValue, className = '' } = props;

  return (
    <div>322</div>
    // <Progress
    //   className={cn(s.root, className)}
    //   type="circle"
    //   size={160}
    //   percent={((entityMaxValue - entityValue) / entityMaxValue) * 100}
    //   strokeColor="#512da8"
    //   trailColor="rgba(25, 118, 210, 0.35)"
    //   strokeWidth={9}
    //   format={() => (
    //     <div className="text-purple-800">
    //       <div className="text-x1.75 font-bold">Key: {entityValue}</div>
    //     </div>
    //   )}
    // />
  );
};

export default InfoCircle;
