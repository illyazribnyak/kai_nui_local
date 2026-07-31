/**
 * Seed initial game data: locations, tribes, skills, starter quests/facts.
 * Safe to re-run — skips / upserts without wiping progress.
 */
import { seedLocations, seedTribes } from '../lib/seed-locations'
import { seedSkills } from '../lib/seed-skills'
import { seedStarterFacts, seedStarterQuests } from '../lib/seed-quests'

async function main() {
  console.log('Seeding Kai-Nui world data...')
  await seedLocations()
  console.log('  ✓ locations')
  await seedTribes()
  console.log('  ✓ tribes')
  await seedSkills()
  console.log('  ✓ skills')
  await seedStarterQuests()
  console.log('  ✓ starter quests')
  await seedStarterFacts()
  console.log('  ✓ starter facts')
  console.log('Done.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
