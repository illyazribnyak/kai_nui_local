import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  galleryItemFromFile,
  isGalleryImageFile,
  labelFromGalleryFilename,
  pickActiveGalleryImage,
  scoreGalleryItem,
  tagsFromGalleryFilename,
} from './lara-gallery'

describe('lara-gallery helpers', () => {
  it('accepts image extensions', () => {
    assert.equal(isGalleryImageFile('lara_sexy.jpg'), true)
    assert.equal(isGalleryImageFile('shot.PNG'), true)
    assert.equal(isGalleryImageFile('README.md'), false)
  })

  it('labels from filename', () => {
    assert.equal(labelFromGalleryFilename('lara_sexy_beach.jpg'), 'sexy beach')
  })

  it('parses tags from filename', () => {
    const t = tagsFromGalleryFilename('lara_sexy_beach_night.jpg')
    assert.ok(t.includes('sexy'))
    assert.ok(t.includes('beach'))
    assert.ok(t.includes('night'))
  })

  it('builds public src with tags', () => {
    const it = galleryItemFromFile('lara_test.jpg')
    assert.equal(it.src, '/avatars/lara-gallery/lara_test.jpg')
  })
})

describe('pickActiveGalleryImage', () => {
  const items = [
    galleryItemFromFile('lara_classic_day.jpg'),
    galleryItemFromFile('lara_sexy_beach.jpg'),
    galleryItemFromFile('lara_sexy_night.jpg'),
    galleryItemFromFile('lara_dark_seductive.jpg'),
    galleryItemFromFile('lara_pregnant_soft.jpg'),
    galleryItemFromFile('lara_boudoir_intimate.jpg'),
  ]

  it('picks beach when on shore with mid desire', () => {
    const pick = pickActiveGalleryImage(items, {
      location: 'Берег острова',
      desire: 55,
      timeOfDay: 'day',
    })
    assert.ok(pick)
    assert.match(pick!.item.file, /beach/i)
  })

  it('picks night sexy at night high desire', () => {
    const pick = pickActiveGalleryImage(items, {
      location: 'Джунглі',
      desire: 80,
      timeOfDay: 'night',
    })
    assert.ok(pick)
    assert.match(pick!.item.file, /night|sexy|boudoir/i)
  })

  it('picks dark when isDarkLara', () => {
    const pick = pickActiveGalleryImage(items, {
      isDarkLara: true,
      desire: 40,
      location: 'Храм',
    })
    assert.ok(pick)
    assert.match(pick!.item.file, /dark/i)
  })

  it('picks pregnant when pregnant', () => {
    const pick = pickActiveGalleryImage(items, {
      isPregnant: true,
      desire: 20,
    })
    assert.ok(pick)
    assert.match(pick!.item.file, /pregnant/i)
  })

  it('scores intimate for boudoir tags', () => {
    const item = galleryItemFromFile('lara_boudoir_intimate.jpg')
    const { score } = scoreGalleryItem(item, { desire: 60, timeOfDay: 'evening' })
    assert.ok(score >= 15)
  })
})
