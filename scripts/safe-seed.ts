/**
 * Prisma seed entry: always runs the safe seed script (no bulk deletes).
 */
import { execSync } from 'child_process'

execSync('tsx --require dotenv/config scripts/seed.ts', { stdio: 'inherit' })
