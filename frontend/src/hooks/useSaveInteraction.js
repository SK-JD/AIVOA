import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../services/api'
import { setSavedId } from '../redux/formSlice'

// Saves the current form directly to the CRM (the "Save Interaction" button).
export function useSaveInteraction() {
  const dispatch = useDispatch()
  const form = useSelector((s) => s.form)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const { hcp_name, interaction_type, date, time, duration, attendees, topics,
        materials_shared, samples_distributed, sentiment, outcomes, followup_actions } = form
      const res = await api.saveInteraction({
        hcp_name, interaction_type, date, time, duration, attendees, topics,
        materials_shared, samples_distributed, sentiment, outcomes, followup_actions,
      })
      dispatch(setSavedId(res.saved_id))
      return res.saved_id
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  return { save, saving, error }
}
