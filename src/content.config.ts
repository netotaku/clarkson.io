import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { CATEGORY_SLUGS } from './utils/categories';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image(),
      theme: z.string().regex(/^#[0-9a-f]{6}$/i),
      cta: z.string().optional(),
      categories: z.array(z.enum(CATEGORY_SLUGS)).min(1).refine(
        (categories) => new Set(categories).size === categories.length,
        'Categories must not contain duplicates',
      ),
    }),
});

export const collections = { blog };
