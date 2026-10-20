'use server'

import { revalidatePath } from 'next/cache'
import { apiDelete } from '@/lib/api/server'

export async function deleteSavedCard(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '')
  if (!id) return

  await apiDelete(`/customers/me/payment_methods/${id}`)
  revalidatePath('/account')
}
