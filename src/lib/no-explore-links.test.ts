import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = join(__dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) return []
    return [path]
  })
}

describe('Explorar is hidden', () => {
  // /explore still renders when opened directly, but nothing in the app points to it.
  it('has no link or reference to /explore and no Explorar copy in the app', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => /['"`]\/explore\b|Explorar/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file))
    expect(offenders).toEqual([])
  })
})
