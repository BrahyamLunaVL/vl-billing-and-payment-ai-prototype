import './flag.css';

import argentina from './flags/argentina.png';
import bolivia from './flags/bolivia.png';
import brasil from './flags/brasil.png';
import chile from './flags/chile.png';
import colombia from './flags/colombia.png';
import costaRica from './flags/costa-rica.png';
import dominicanRepublic from './flags/dominican-republic.png';
import ecuador from './flags/ecuador.png';
import elSalvador from './flags/el-salvador.png';
import guatemala from './flags/guatemala.png';
import honduras from './flags/honduras.png';
import mexico from './flags/mexico.png';
import nicaragua from './flags/nicaragua.png';
import panama from './flags/panama.png';
import paraguay from './flags/paraguay.png';
import peru from './flags/peru.png';
import spain from './flags/spain.png';
import unitedStates from './flags/united-states.png';
import uruguay from './flags/uruguay.png';
import venezuela from './flags/venezuela.png';

export type FlagCountry =
  | 'argentina'
  | 'bolivia'
  | 'brasil'
  | 'chile'
  | 'colombia'
  | 'costa-rica'
  | 'dominican-republic'
  | 'ecuador'
  | 'el-salvador'
  | 'guatemala'
  | 'honduras'
  | 'mexico'
  | 'nicaragua'
  | 'panama'
  | 'paraguay'
  | 'peru'
  | 'spain'
  | 'united-states'
  | 'uruguay'
  | 'venezuela';

const FLAGS: Record<FlagCountry, string> = {
  argentina,
  bolivia,
  brasil,
  chile,
  colombia,
  'costa-rica': costaRica,
  'dominican-republic': dominicanRepublic,
  ecuador,
  'el-salvador': elSalvador,
  guatemala,
  honduras,
  mexico,
  nicaragua,
  panama,
  paraguay,
  peru,
  spain,
  'united-states': unitedStates,
  uruguay,
  venezuela,
};

export interface FlagProps {
  /** Country flag to render. */
  country: FlagCountry;
  /** Width/height in pixels. Flags are square. Defaults to 16. */
  size?: number;
  className?: string;
}

export function Flag({ country, size = 16, className }: FlagProps) {
  return (
    <img
      src={FLAGS[country]}
      width={size}
      height={size}
      alt={`${country} flag`}
      className={className ? `flag ${className}` : 'flag'}
    />
  );
}
