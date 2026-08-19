import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function globalSetup() {
  const scriptPath = path.join(__dirname, '..', '..', 'reset_test_data.py')
  const projectRoot = path.join(__dirname, '..', '..')
  execSync(`python "${scriptPath}"`, { cwd: projectRoot, stdio: 'pipe' })
  console.log('Global setup: test data reset')
}
