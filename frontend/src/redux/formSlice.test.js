import { describe, it, expect } from 'vitest'
import reducer, {
  applyPatch,
  addMaterial,
  removeMaterial,
  addSample,
  addSuggestionToFollowups,
  loadInteraction,
} from './formSlice'
import { EMPTY_FORM } from '../utils/constants'

const initial = { ...EMPTY_FORM, savedId: null, suggestions: [], updatedFields: [] }

describe('formSlice', () => {
  it('applyPatch merges known fields and records what changed', () => {
    const next = reducer(initial, applyPatch({ hcp_name: 'Dr. Smith', sentiment: 'Positive', bogus: 'x' }))
    expect(next.hcp_name).toBe('Dr. Smith')
    expect(next.sentiment).toBe('Positive')
    expect(next.bogus).toBeUndefined() // unknown keys ignored
    expect(next.updatedFields).toEqual(['hcp_name', 'sentiment'])
  })

  it('addMaterial appends and dedupes by name', () => {
    let s = reducer(initial, addMaterial({ type: 'Brochure', name: 'Product X Brochure' }))
    s = reducer(s, addMaterial({ type: 'Brochure', name: 'Product X Brochure' })) // duplicate
    expect(s.materials_shared).toHaveLength(1)
    expect(s.materials_shared[0]).toEqual({ type: 'Brochure', name: 'Product X Brochure' })
  })

  it('removeMaterial removes by index', () => {
    let s = reducer(initial, addMaterial({ type: 'Brochure', name: 'A' }))
    s = reducer(s, addMaterial({ type: 'Clinical Study', name: 'B' }))
    s = reducer(s, removeMaterial(0))
    expect(s.materials_shared).toEqual([{ type: 'Clinical Study', name: 'B' }])
  })

  it('addSample stores name + quantity', () => {
    const s = reducer(initial, addSample({ name: 'Product X Sample', quantity: 2 }))
    expect(s.samples_distributed).toEqual([{ name: 'Product X Sample', quantity: 2 }])
  })

  it('addSuggestionToFollowups appends text and consumes the suggestion', () => {
    const withSugg = { ...initial, suggestions: ['Call in 2 weeks'] }
    const s = reducer(withSugg, addSuggestionToFollowups('Call in 2 weeks'))
    expect(s.followup_actions).toContain('Call in 2 weeks')
    expect(s.suggestions).toEqual([])
  })

  it('loadInteraction hydrates the form from a saved row (ignoring extra keys)', () => {
    const row = {
      id: 7, created_at: '2026-07-14', hcp_name: 'Dr. Rajesh Kumar',
      topics: 'CardioPlus', sentiment: 'Positive', duration: '25 minutes',
      attendees: [{ name: 'Anitha Rao', role: 'Product Specialist' }],
    }
    const s = reducer({ ...initial, savedId: 3 }, loadInteraction(row))
    expect(s.hcp_name).toBe('Dr. Rajesh Kumar')
    expect(s.sentiment).toBe('Positive')
    expect(s.duration).toBe('25 minutes')
    expect(s.attendees[0].role).toBe('Product Specialist')
    expect(s.id).toBeUndefined() // extra keys not merged
    expect(s.savedId).toBeNull()
    expect(s.updatedFields).toContain('hcp_name')
  })
})
