import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  applySexSkillModifiers,
  computeSkillModifiers,
  levelToDiceBonus,
  resolveSexSkillDiceBonus,
  skillLevel,
} from './skill-effects'
import { SEX_SKILL_TREE } from './sex-skill-tree'
import { SKILL_NAMES } from './constants'

describe('sex skill tree integrity', () => {
  it('all tree names exist in SKILL_NAMES', () => {
    for (const node of SEX_SKILL_TREE) {
      assert.ok(
        (SKILL_NAMES as readonly string[]).includes(node.name),
        `missing seed skill: ${node.name}`
      )
    }
  })

  it('has expanded tree (sex + combat + social design pack)', () => {
    assert.ok(SEX_SKILL_TREE.length >= 80, `got ${SEX_SKILL_TREE.length}`)
    assert.ok(SEX_SKILL_TREE.some((n) => n.name === 'Гра з розміром'))
    assert.ok(SEX_SKILL_TREE.some((n) => n.name === 'Знання рас'))
    assert.ok(SEX_SKILL_TREE.some((n) => n.name === 'Бій без зброї'))
  })

  it('has separate intimacy branches including vaginal/public/creampie/aftercare', () => {
    for (const cat of [
      'dirty_talk',
      'handjob',
      'blowjob',
      'deepthroat',
      'anal',
      'riding',
      'edging',
      'public',
      'creampie',
      'aftercare',
    ] as const) {
      const nodes = SEX_SKILL_TREE.filter((n) => n.category === cat)
      assert.equal(nodes.length, 4, cat)
    }
    // vaginal has base 4 + «Гра з розміром»
    assert.equal(SEX_SKILL_TREE.filter((n) => n.category === 'vaginal').length, 5)
    assert.equal(SEX_SKILL_TREE.filter((n) => n.category === 'combat').length, 5)
    assert.equal(SEX_SKILL_TREE.filter((n) => n.category === 'social').length, 5)
    assert.ok(SEX_SKILL_TREE.some((n) => n.name === 'Глибоке горло' && n.levelMeanings?.length === 5))
  })
})

describe('levelToDiceBonus', () => {
  it('maps levels to bonuses', () => {
    assert.equal(levelToDiceBonus(0), 0)
    assert.equal(levelToDiceBonus(1), 1)
    assert.equal(levelToDiceBonus(2), 1)
    assert.equal(levelToDiceBonus(3), 2)
    assert.equal(levelToDiceBonus(5), 5)
  })
})

describe('resolveSexSkillDiceBonus', () => {
  const skills = [
    { name: 'Ніжний дотик', level: 3 },
    { name: 'Множинне задоволення', level: 2 },
    { name: 'Аура бажання', level: 5 },
  ]

  it('matches exact skill name', () => {
    const r = resolveSexSkillDiceBonus('Ніжний дотик', skills)
    assert.equal(r.matchedSkill, 'Ніжний дотик')
    assert.equal(r.bonus, 2)
  })

  it('matches keywords', () => {
    const r = resolveSexSkillDiceBonus('перевірка дотику', skills)
    assert.equal(r.matchedSkill, 'Ніжний дотик')
    assert.ok(r.bonus >= 2)
  })

  it('aura capstone adds flat bonus', () => {
    const r = resolveSexSkillDiceBonus('Аура бажання', skills)
    assert.ok(r.bonus >= 5)
  })
})

describe('applySexSkillModifiers', () => {
  it('boosts partner pleasure from technique', () => {
    const merged: any = { pleasure: { lara: 40, partner: 50 } }
    const skills = [
      { name: 'Ніжний дотик', level: 2 },
      { name: 'Майстерність рук', level: 2 },
    ]
    const { applied, modifiers } = applySexSkillModifiers(merged, skills)
    assert.ok(modifiers.partnerPleasureBonusPct > 0)
    assert.ok(merged.pleasure.partner > 50)
    assert.ok(applied.length > 0)
  })

  it('blocks multi-orgasm continue when skill < 2', () => {
    const merged: any = { multiOrgasm: { chain: 2, can_continue: true, multiplier: 1.5 } }
    applySexSkillModifiers(merged, [{ name: 'Множинне задоволення', level: 1 }])
    assert.equal(merged.multiOrgasm.can_continue, false)
  })

  it('unlocks multi-orgasm at level 2+', () => {
    const m = computeSkillModifiers([{ name: 'Множинне задоволення', level: 2 }])
    assert.equal(m.multiOrgasmUnlocked, true)
  })

  it('raises amulet gain from body magic', () => {
    const merged: any = { sceneSummary: { amulet_gain: 10 } }
    applySexSkillModifiers(merged, [{ name: 'Екстаз сили', level: 5 }])
    assert.ok(merged.sceneSummary.amulet_gain >= 15)
  })

  it('applies stamina floor from Тривала насолода', () => {
    const merged: any = { stamina: { value: 5, tempo: 'medium' } }
    applySexSkillModifiers(merged, [{ name: 'Тривала насолода', level: 3 }])
    assert.equal(merged.stamina.value, 9)
  })
})

describe('skillLevel', () => {
  it('returns 0 for missing', () => {
    assert.equal(skillLevel([], 'Ніжний дотик'), 0)
  })
})
