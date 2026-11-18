import { getCollection } from 'astro:content';

export const getLatestPosts = async (limit: number) => {
  const posts = await getCollection('blog');

  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  ).slice(0, limit);
};

export const getLatestPost = async () => (await getLatestPosts(1))[0];
