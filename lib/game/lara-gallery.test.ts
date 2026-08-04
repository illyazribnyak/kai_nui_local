import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  galleryItemFromFile,
  isGalleryImageFile,
  labelFromGalleryFilename,
} from './lara-gallery'

describe('lara-gallery helpers', () => {
  it('accepts image extensions', () => {
    assert.equal(isGalleryImageFile('lara_sexy.jpg'), true)
    assert.equal(isGalleryImageFile('shot.PNG'), true)
    assert.equal(isGalleryImageFile('README.md'), false)
    assert.equal(isGalleryImageFile('.gitkeep'), false)
  })

  it('labels from filename', () => {
    assert.equal(labelFromGalleryFilename('lara_sexy_beach.jpg'), 'sexy beach')
    assert.equal(labelFromGalleryFilename('boudoir_01.png'), 'boudoir 01')
  })

  it('builds public src', () => {
    const it = galleryItemFromFile('lara_test.jpg')
    assert.equal(it.src, '/avatars/lara-gallery/lara_test.jpg')
    assert.equal(it.label, 'test')
  })
})
