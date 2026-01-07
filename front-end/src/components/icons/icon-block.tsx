import { useIcon } from '@hooks/use-icon';
import { Tooltip } from '@components/Tooltip/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconsProps } from '@data/icon';

export const IconBlock = ({
  iteration, 
  component 
}: {
  iteration: IconsProps[],
  component?: React.ReactNode 
}): JSX.Element[] => {
  const { iconIndex, iconClick } = useIcon();

  return iteration.map((v, i) => (
    <div>
      {component}
      <Tooltip text={v?.text}>
        <button
          className={i === iconIndex ? 'clicked icon' : 'icon'}
          onClick={() => { if (!v.buttonProps) iconClick(i) }}
        >
          <FontAwesomeIcon icon={v.icon} /> 
        </button>
      </Tooltip>
    </div>
  ))
};