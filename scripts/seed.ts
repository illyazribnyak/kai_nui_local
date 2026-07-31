/**
 * Seed initial game data: locations, tribes, skills.
 * Safe to re-run — skips tables that already have rows.
 */
import { seedLocations, seedTribes } from '../lib/seed-locations'
import { seedSkills } from '../lib/seed-skills'

async function main() {
  console.log('Seeding Kai-Nui world data...')
  await seedLocations()
  console.log('  ✓ locations')
  await seedTribes()
  console.log('  ✓ tribes')
  await seedSkills()
  console.log('  ✓ skills')
  console.log('Done.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
