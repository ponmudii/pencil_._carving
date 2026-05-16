/* ============================================
   GITHUB API — Gallery Image Fetcher
   Preserved from existing website logic
   ============================================ */

import { ParsedFileName, GalleryProduct, GalleryCategory } from '@/types';

const GITHUB_USER = process.env.NEXT_PUBLIC_GITHUB_USER || 'ponmudii';
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'pencil_._carving';
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

export const galleryCategories: Record<string, GalleryCategory> = {
  pencil_carving: {
    id: 'pencil_carving',
    title: 'Pencil Carving Masterpieces',
    path: 'public/assets/Carvings',
    image: '/assets/images/pencilcarving.png',
    description: 'Names, quotes & microscopic art intricately carved on graphite.',
  },
  frames: {
    id: 'frames',
    title: 'Custom Frames',
    path: 'public/assets/Frames',
    image: '/assets/images/frame.jpg',
    description: 'Combine photos, quotes, and carvings beautifully framed forever.',
  },
  chocolates: {
    id: 'chocolates',
    title: 'Custom Chocolates',
    path: 'public/assets/Chocolates',
    image: '/assets/images/chocolate.jpg',
    description: 'Delicious treats re-wrapped with your personal message or design.',
  },
  hampers: {
    id: 'hampers',
    title: 'Gift Hampers',
    path: 'public/assets/Hampers',
    image: '/assets/images/hamper.png',
    description: 'A curated sea of premium gifts made specially for your chosen one.',
  },
  portraits: {
    id: 'portraits',
    title: 'Handcrafted Portraits',
    path: 'public/assets/portraits',
    image: '/assets/images/portrait.jpg',
    description: 'Stunning, detailed handcrafted portraits bringing subjects to life.',
  },
};

/**
 * Parse filename to extract metadata: ID-PRICE-TITLE-SUBTITLE.jpg
 * Supports hover variants: ID-h1-PRICE-TITLE-SUBTITLE.jpg
 * Supports pinned items: 1p-250-Title.jpg
 */
export function parseFileName(filename: string): ParsedFileName {
  const nameOnly = filename.replace(/\.[^.]+$/, '');
  const parts = nameOnly.split('-');

  const idPart = parts[0] || '999';

  let isHover = false;
  let hoverNum = 0;
  let priceIndex = 1;

  if (parts[1] && /^h[0-9]+$/i.test(parts[1])) {
    isHover = true;
    hoverNum = parseInt(parts[1].substring(1));
    priceIndex = 2;
  }

  const pricePart = parts[priceIndex] || null;
  const titlePart = parts[priceIndex + 1]
    ? parts[priceIndex + 1].replace(/_/g, ' ')
    : 'Handcrafted Masterpiece';
  const subtitlePart = parts[priceIndex + 2]
    ? parts[priceIndex + 2].replace(/_/g, ' ')
    : 'Specially made for you';

  let pinned = false;
  let num = 999;
  if (idPart.endsWith('p')) {
    pinned = true;
    num = parseInt(idPart) || 999;
  } else {
    num = parseInt(idPart) || 999;
  }

  const priceNum = pricePart ? parseInt(pricePart) || 0 : 0;

  return {
    idPart,
    isHover,
    hoverNum,
    pinned,
    num,
    price: pricePart ? 'Rs. ' + pricePart : 'Rs. 000',
    priceNum,
    title: titlePart,
    subtitle: subtitlePart,
  };
}

interface GitHubFile {
  name: string;
  type: string;
  download_url: string;
}

/**
 * Fetch folder contents from GitHub API
 */
export async function fetchGitHubFolder(folderPath: string): Promise<GitHubFile[]> {
  const cacheBuster = Date.now();
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${folderPath}?ref=${GITHUB_BRANCH}&cb=${cacheBuster}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const files = await response.json();
    if (!Array.isArray(files)) return [];

    return files.filter((f: GitHubFile) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return f.type === 'file' && IMAGE_EXTENSIONS.includes(ext);
    });
  } catch (e) {
    console.error('GitHub API error:', e);
    return [];
  }
}

/**
 * Fetch and process gallery products for a category
 */
export async function fetchGalleryProducts(categoryId: string): Promise<GalleryProduct[]> {
  const data = galleryCategories[categoryId];
  if (!data) return [];

  const files = await fetchGitHubFolder(data.path);

  interface GroupedProduct {
    main: { name: string; localPath: string; download_url: string; meta: ParsedFileName } | null;
    hovers: { name: string; localPath: string; download_url: string; meta: ParsedFileName }[];
  }

  const grouped: Record<string, GroupedProduct> = {};

  files.forEach((f) => {
    const meta = parseFileName(f.name);
    const idKey = meta.idPart;
    if (!grouped[idKey]) {
      grouped[idKey] = { main: null, hovers: [] };
    }
    const fileEntry = {
      name: f.name,
      localPath: `${data.path}/${f.name}`,
      download_url: f.download_url,
      meta,
    };
    if (meta.isHover) {
      grouped[idKey].hovers.push(fileEntry);
    } else {
      grouped[idKey].main = fileEntry;
    }
  });

  const validProducts: GroupedProduct[] = [];
  Object.values(grouped).forEach((prod) => {
    if (prod.main) {
      prod.hovers.sort((a, b) => a.meta.hoverNum - b.meta.hoverNum);
      validProducts.push(prod);
    } else if (prod.hovers.length > 0) {
      prod.hovers.sort((a, b) => a.meta.hoverNum - b.meta.hoverNum);
      prod.main = prod.hovers.shift()!;
      validProducts.push(prod);
    }
  });

  validProducts.sort((a, b) => {
    if (a.main!.meta.pinned && !b.main!.meta.pinned) return -1;
    if (!a.main!.meta.pinned && b.main!.meta.pinned) return 1;
    if (a.main!.meta.pinned && b.main!.meta.pinned)
      return a.main!.meta.num - b.main!.meta.num;
    return b.main!.meta.num - a.main!.meta.num;
  });

  return validProducts.map((prod) => {
    const main = prod.main!;
    const rawUrl =
      main.download_url ||
      `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${encodeURI(main.localPath).replace(/#/g, '%23')}`;
    return {
      path: rawUrl,
      price: main.meta.price,
      priceNum: main.meta.priceNum,
      title: main.meta.title,
      subtitle: main.meta.subtitle,
      category: categoryId,
      hovers: prod.hovers.map(
        (h) =>
          h.download_url ||
          `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${encodeURI(h.localPath).replace(/#/g, '%23')}`
      ),
    };
  });
}
