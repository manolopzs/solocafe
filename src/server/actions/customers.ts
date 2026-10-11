'use server'

import { revalidatePath } from 'next/cache'
import { apiPatch } from '@/lib/api/server'

export async function updateCustomerProfile(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  await apiPatch('/customers/me', { customer: { name, phone } })
  revalidatePath('/account')
}
