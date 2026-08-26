export const categorySlug = (category: string) =>
  category
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categoryLabel = (category: string) =>
  categorySlug(category)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
