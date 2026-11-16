import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Guard for the Spain-Spanish copy pass: these Latin American phrasings were replaced and should not come back.
const BANNED = [/\bordenan\b/, /\bCanjeaste\b/, /Arma tu menú/, /son requeridos/, /\bReordenar\b/, /Ingresa tu/, /Tu de siempre/, /Nombre de la cafeteria\b/, />Direccion</]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe('es-ES copy', () => {
  it('has no Latin American phrasings left in user-facing source', () => {
    const hits = sourceFiles(join(process.cwd(), 'src')).flatMap((file) => {
      const text = readFileSync(file, 'utf8')
      return BANNED.filter((pattern) => pattern.test(text)).map((pattern) => `${file}: ${pattern}`)
    })
    expect(hits).toEqual([])
  })
})
