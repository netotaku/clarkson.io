import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'src/content');

const listMarkdownFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listMarkdownFiles(entryPath) : entryPath;
    }),
  );

  return files.flat().filter((file) => /\.mdx?$/i.test(file));
};

const resolveImagePath = (imageReference) => {
  if (imageReference.startsWith('/src/')) {
    return path.join(projectRoot, imageReference.slice(1));
  }

  if (imageReference.startsWith('/')) {
    return path.join(projectRoot, 'public', imageReference.slice(1));
  }

  return path.resolve(contentRoot, imageReference);
};

const toHsl = (red, green, blue) => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;
  const saturation = delta === 0
    ? 0
    : delta / (1 - Math.abs(2 * lightness - 1));

  return { lightness, saturation };
};

const toHex = (value) => Math.round(value).toString(16).padStart(2, '0');

const sampleHighlight = async (imagePath) => {
  const { data, info } = await sharp(imagePath)
    .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map();

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];

    if (alpha < 160) continue;

    const key = `${red >> 4}-${green >> 4}-${blue >> 4}`;
    const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count += 1;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    buckets.set(key, bucket);
  }

  const minimumFrequency = Math.max(2, Math.round((data.length / info.channels) * 0.0005));
  const colours = [...buckets.values()]
    .filter((bucket) => bucket.count >= minimumFrequency)
    .map((bucket) => {
      const red = bucket.red / bucket.count;
      const green = bucket.green / bucket.count;
      const blue = bucket.blue / bucket.count;
      const { lightness, saturation } = toHsl(red, green, blue);

      return { ...bucket, red, green, blue, lightness, saturation };
    });

  const colourfulHighlights = colours.filter(
    ({ lightness, saturation }) =>
      lightness >= 0.35 && lightness <= 0.92 && saturation >= 0.18,
  );
  const candidates = colourfulHighlights.length > 0
    ? colourfulHighlights
    : colours.filter(({ lightness }) => lightness <= 0.95);
  const highlight = candidates.sort((a, b) => {
    const score = (colour) =>
      colour.lightness * (0.65 + colour.saturation * 0.35) +
      Math.min(0.08, Math.log2(colour.count + 1) / 100);
    return score(b) - score(a);
  })[0];

  if (!highlight) {
    throw new Error('No opaque pixels were available to sample');
  }

  return `#${toHex(highlight.red)}${toHex(highlight.green)}${toHex(highlight.blue)}`;
};

const updateTheme = async (contentPath) => {
  const source = await readFile(contentPath, 'utf8');
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatterMatch) throw new Error('Front matter was not found');

  const heroMatch = frontmatterMatch[1].match(/^heroImage:\s*['"]?([^'"\r\n]+)['"]?\s*$/m);
  if (!heroMatch) throw new Error('heroImage was not found in front matter');

  const theme = await sampleHighlight(resolveImagePath(heroMatch[1].trim()));
  const updatedFrontmatter = /^theme:/m.test(frontmatterMatch[1])
    ? frontmatterMatch[1].replace(/^theme:.*$/m, `theme: '${theme}'`)
    : frontmatterMatch[1].replace(
        /^heroImage:.*$/m,
        (heroLine) => `${heroLine}\ntheme: '${theme}'`,
      );
  const updatedSource = source.replace(frontmatterMatch[1], updatedFrontmatter);

  if (updatedSource !== source) await writeFile(contentPath, updatedSource);

  return theme;
};

const files = await listMarkdownFiles(contentRoot);
const failures = [];

for (const file of files) {
  try {
    const theme = await updateTheme(file);
    console.log(`${path.relative(projectRoot, file)}: ${theme}`);
  } catch (error) {
    failures.push(`${path.relative(projectRoot, file)}: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.join('\n')}`);
  process.exitCode = 1;
}
