import type { FlagCountry } from '../Flag';

export const COUNTRY_NAMES: Record<FlagCountry, string> = {
  argentina: 'Argentina',
  bolivia: 'Bolivia',
  brasil: 'Brazil',
  chile: 'Chile',
  colombia: 'Colombia',
  'costa-rica': 'Costa Rica',
  'dominican-republic': 'Dominican Republic',
  ecuador: 'Ecuador',
  'el-salvador': 'El Salvador',
  guatemala: 'Guatemala',
  honduras: 'Honduras',
  mexico: 'Mexico',
  nicaragua: 'Nicaragua',
  panama: 'Panama',
  paraguay: 'Paraguay',
  peru: 'Peru',
  spain: 'Spain',
  'united-states': 'United States',
  uruguay: 'Uruguay',
  venezuela: 'Venezuela',
};

/** All countries, sorted alphabetically by display name. */
export const COUNTRIES: FlagCountry[] = (Object.keys(COUNTRY_NAMES) as FlagCountry[]).sort(
  (a, b) => COUNTRY_NAMES[a].localeCompare(COUNTRY_NAMES[b]),
);
