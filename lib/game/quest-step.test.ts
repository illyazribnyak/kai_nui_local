import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { QUEST_LADDER, QUEST_LADDER_TITLES } from './quest-ladder-data'
import { isLadderStepComplete, planLadderCompletions } from './quest-step'

const emptyCtx = {
  currentLoc: 'Берег острова',
  discoveredLocs: [{ name: 'Берег острова' }],
  factKeys: [] as string[],
  metNames: [] as string[],
  inventory: [] as { name: string; category: string }[],
}

describe('QUEST_LADDER', () => {
  it('has 8 main story steps', () => {
    assert.equal(QUEST_LADDER.length, 8)
    assert.equal(QUEST_LADDER_TITLES[0], 'Вижити на березі')
    assert.equal(QUEST_LADDER_TITLES[QUEST_LADDER_TITLES.length - 1], 'Скарб Атлантів')
  })
})

describe('isLadderStepComplete', () => {
  it('survival completes at waterfall', () => {
    const step = QUEST_LADDER[0]
    assert.equal(
      isLadderStepComplete(step, {
        ...emptyCtx,
        currentLoc: 'Водоспад у джунглях',
      }),
      true
    )
  })

  it('survival completes with food item', () => {
    assert.equal(
      isLadderStepComplete(QUEST_LADDER[0], {
        ...emptyCtx,
        inventory: [{ name: 'Кокос', category: 'їжа' }],
      }),
      true
    )
  })

  it('jungle not complete on beach', () => {
    assert.equal(isLadderStepComplete(QUEST_LADDER[1], emptyCtx), false)
  })

  it('tribe contact completes when met Tane', () => {
    assert.equal(
      isLadderStepComplete(QUEST_LADDER[2], {
        ...emptyCtx,
        metNames: ['тане'],
      }),
      true
    )
  })

  it('guest of tribe completes when met Makai', () => {
    assert.equal(
      isLadderStepComplete(QUEST_LADDER[3], {
        ...emptyCtx,
        metNames: ['макаї'],
      }),
      true
    )
  })

  it('amulet step completes on fact', () => {
    assert.equal(
      isLadderStepComplete(QUEST_LADDER[4], {
        ...emptyCtx,
        factKeys: ['amulet_awakened'],
      }),
      true
    )
  })

  it('depths completes on mountain location', () => {
    assert.equal(
      isLadderStepComplete(QUEST_LADDER[5], {
        ...emptyCtx,
        currentLoc: 'Священна гора',
      }),
      true
    )
  })
})

describe('planLadderCompletions', () => {
  it('does not skip ahead', () => {
    const plan = planLadderCompletions([], {
      ...emptyCtx,
      currentLoc: 'Храм насолоди',
      discoveredLocs: [{ name: 'Храм насолоди' }],
    })
    // temple location alone shouldn't complete treasure without prior steps
    assert.equal(plan.complete.length, 0)
    assert.equal(plan.nextActive, 'Вижити на березі')
  })

  it('completes survival at waterfall (may chain jungle if name overlaps)', () => {
    const plan = planLadderCompletions([], {
      ...emptyCtx,
      currentLoc: 'Водоспад у джунглях',
      inventory: [{ name: 'Вода', category: 'misc' }],
    })
    assert.ok(plan.complete.includes('Вижити на березі'))
    // "джунгл" in location name can also complete the next step in one tick
    assert.ok(
      plan.nextActive === 'Увійти в джунглі' ||
        plan.complete.includes('Увійти в джунглі') ||
        plan.nextActive === 'Знайти людей острова'
    )
  })

  it('after survival, jungle fact completes next', () => {
    const plan = planLadderCompletions(['Вижити на березі'], {
      ...emptyCtx,
      factKeys: ['entered_jungle'],
    })
    assert.deepEqual(plan.complete, ['Увійти в джунглі'])
    assert.equal(plan.nextActive, 'Знайти людей острова')
  })

  it('chains contact → guest when village discovered', () => {
    const plan = planLadderCompletions(
      ['Вижити на березі', 'Увійти в джунглі'],
      {
        ...emptyCtx,
        currentLoc: 'Селище Кай-Тору',
        discoveredLocs: [{ name: 'Селище Кай-Тору' }],
      }
    )
    assert.ok(plan.complete.includes('Знайти людей острова'))
    assert.ok(plan.complete.includes('Гостя Кай-Тору'))
    assert.equal(plan.nextActive, 'Зрозуміти амулет')
  })
})
