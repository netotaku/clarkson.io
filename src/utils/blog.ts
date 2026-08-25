import { getCollection } from 'astro:content';

export const getLatestPost = async () => {
  const posts = await getCollection('blog');

  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )[0];
};
