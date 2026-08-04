export const dynamic = 'force-dynamic'

import { readdir } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import {
  galleryContextFromState,
  galleryItemFromFile,
  isGalleryImageFile,
  LARA_GALLERY_DIR,
  pickActiveGalleryImage,
} from '@/lib/game/lara-gallery'

/** List images + optional active pick from game-state query params. */
export async function GET(request: NextRequest) {
  try {
    const dir = path.join(process.cwd(), LARA_GALLERY_DIR)
    const names = await readdir(dir)
    const items = names
      .filter(isGalleryImageFile)
      .sort((a, b) => a.localeCompare(b, 'en'))
      .map(galleryItemFromFile)

    const sp = request.nextUrl.searchParams
    const ctx = galleryContextFromState({
      location: sp.get('location'),
      timeOfDay: sp.get('timeOfDay'),
      mood: sp.get('mood'),
      weather: sp.get('weather'),
      desire: sp.has('desire') ? Number(sp.get('desire')) : null,
      shame: sp.has('shame') ? Number(sp.get('shame')) : null,
      confidence: sp.has('confidence') ? Number(sp.get('confidence')) : null,
      isDarkLara: sp.get('isDarkLara') === '1' || sp.get('isDarkLara') === 'true',
      isPregnant: sp.get('isPregnant') === '1' || sp.get('isPregnant') === 'true',
      clothing: sp.get('clothing'),
      chapter: sp.get('chapter'),
      dayNumber: sp.has('dayNumber') ? Number(sp.get('dayNumber')) : null,
    }, {
      inSexScene: sp.get('inSexScene') === '1' || sp.get('inSexScene') === 'true',
    })

    const active = pickActiveGalleryImage(items, ctx)

    return NextResponse.json({
      ok: true,
      count: items.length,
      items,
      active: active
        ? {
            file: active.item.file,
            src: active.item.src,
            label: active.item.label,
            tags: active.item.tags,
            score: active.score,
            reasons: active.reasons,
          }
        : null,
      dropPath: LARA_GALLERY_DIR,
      namingHint:
        'Імена з ключовими словами: sexy, beach, night, dark, pregnant, boudoir, intimate, wet, tribal, ritual, afterglow…',
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        count: 0,
        items: [],
        active: null,
        error: e?.message || 'gallery read failed',
      },
      { status: 200 }
    )
  }
}
