export const CATEGORY_SLUGS = [
  'agency-life',
  'ai',
  'web-development',
  'digital-strategy',
  'design-and-accessibility',
  'privacy-and-ethics',
  'technology-and-culture',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

const categoryLabels: Record<CategorySlug, string> = {
  'agency-life': 'Agency Life',
  ai: 'AI',
  'web-development': 'Web Development',
  'digital-strategy': 'Digital Strategy',
  'design-and-accessibility': 'Design and Accessibility',
  'privacy-and-ethics': 'Privacy and Ethics',
  'technology-and-culture': 'Technology and Culture',
};

export const categorySlug = (category: string) =>
  category
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categoryLabel = (category: string) =>
  categoryLabels[categorySlug(category) as CategorySlug] ?? categorySlug(category)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
