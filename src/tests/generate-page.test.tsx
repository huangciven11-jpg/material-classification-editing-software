import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GeneratePage } from '../pages/generate-page'

describe('generate-page', () => {
  it('renders generated script segments', () => {
    render(<GeneratePage script="沙发上全是毛。轻轻一刷就干净。" onScriptChange={() => {}} />)
    expect(screen.getByText('镜头位 1')).toBeTruthy()
    expect(screen.getByText('镜头位 2')).toBeTruthy()
  })
})
