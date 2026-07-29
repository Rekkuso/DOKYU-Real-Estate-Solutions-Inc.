import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
  console.log("Fetching admins from profiles table...")
  const { data: profiles, error } = await supabase.from('profiles').select('id, role').eq('role', 'admin')
  if (error) {
    console.error("Fetch Error:", JSON.stringify(error, null, 2))
    return
  }
  
  if (!profiles || profiles.length === 0) {
    console.log("No admins found in profiles table.")
    return;
  }
  
  for (const profile of profiles) {
    console.log(`Setting app_metadata.role='admin' for user ${profile.id}...`)
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      { app_metadata: { role: 'admin' } }
    )
    if (updateError) {
      console.error("Error:", updateError)
    } else {
      console.log(`Successfully updated user ${profile.id}!`)
    }
  }
}

run()
