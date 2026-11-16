/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { ExploreIntro } from './explore-intro'

describe('ExploreIntro', () => {
  it('asks the customer to pick a café', () => {
    render(<ExploreIntro sort="name" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Elige tu cafetería' })).toBeInTheDocument()
    expect(screen.getByText('Pide desde aquí y recoge sin cola.')).toBeInTheDocument()
    expect(screen.queryByText(/más cercana/)).not.toBeInTheDocument()
  })

  it('says the list is sorted by distance when location is on', () => {
    render(<ExploreIntro sort="distance" />)
    expect(screen.getByText('Ordenadas de la más cercana a la más lejana.')).toBeInTheDocument()
  })
})
