export const dynamic = 'force-dynamic'

import { readdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import {
  galleryItemFromFile,
  isGalleryImageFile,
  LARA_GALLERY_DIR,
} from '@/lib/game/lara-gallery'

/** List images dropped into public/avatars/lara-gallery/ */
export async function GET() {
  try {
    const dir = path.join(process.cwd(), LARA_GALLERY_DIR)
    const names = await readdir(dir)
    const items = names
      .filter(isGalleryImageFile)
      .sort((a, b) => a.localeCompare(b, 'en'))
      .map(galleryItemFromFile)

    return NextResponse.json({
      ok: true,
      count: items.length,
      items,
      dropPath: LARA_GALLERY_DIR,
      hint: 'Поклади .jpg/.png/.webp у цю папку — вони з’являться тут після оновлення.',
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        count: 0,
        items: [],
        error: e?.message || 'gallery read failed',
      },
      { status: 200 }
    )
  }
}
