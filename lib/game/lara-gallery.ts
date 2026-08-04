/**
 * User-drop Lara image gallery.
 * Files live in public/avatars/lara-gallery/ and are listed by /api/lara-gallery.
 */

export const LARA_GALLERY_DIR = 'public/avatars/lara-gallery'
export const LARA_GALLERY_PUBLIC_PREFIX = '/avatars/lara-gallery'

export const LARA_GALLERY_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

export type LaraGalleryItem = {
  /** Public URL path */
  src: string
  /** Filename on disk */
  file: string
  /** Human label from filename */
  label: string
}

/** Turn lara_sexy_beach.jpg → "sexy beach" */
export function labelFromGalleryFilename(file: string): string {
  const base = file.replace(/\.[^.]+$/i, '')
  return base
    .replace(/^lara[_-]?/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || base
}

export function isGalleryImageFile(file: string): boolean {
  const lower = file.toLowerCase()
  if (lower === 'readme.md' || lower.startsWith('.')) return false
  return LARA_GALLERY_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export function galleryItemFromFile(file: string): LaraGalleryItem {
  return {
    file,
    src: `${LARA_GALLERY_PUBLIC_PREFIX}/${encodeURIComponent(file).replace(/%2F/gi, '/')}`,
    label: labelFromGalleryFilename(file),
  }
}
