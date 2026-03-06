export const TECHNICIANS = [
  'Evan',
  'Maleek',
  'Jelom',
  'Artem',
] as const;

export const COMPANIES = ['Premium', 'BSD', 'Rocky', 'Best Pro'] as const;

export const REVIEW_TYPES = {
  review: { label: 'Review only', amount: 15 },
  review_pic: { label: 'Review + Picture', amount: 25 },
} as const;

export type Technician = (typeof TECHNICIANS)[number];
export type Company = (typeof COMPANIES)[number];
export type ReviewType = keyof typeof REVIEW_TYPES;
