import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering - this page uses Supabase
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select()

  return <pre>{JSON.stringify(events, null, 2)}</pre>
}