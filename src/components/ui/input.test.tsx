/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { Input } from './input'
import { Textarea } from './textarea'

describe('form placeholders', () => {
  it('use the lighter input-border grey so they do not read as filled-in values', () => {
    render(
      <>
        <Input placeholder="What is your name?" />
        <Textarea placeholder="Optional" />
      </>,
    )
    for (const field of [screen.getByPlaceholderText('What is your name?'), screen.getByPlaceholderText('Optional')]) {
      expect(field.className).toContain('placeholder:text-input-border')
      expect(field.className).not.toContain('placeholder:text-muted-foreground')
    }
  })
})
