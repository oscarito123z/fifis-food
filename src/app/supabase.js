import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tekraccexqofponeighg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3JhY2NleHFvZnBvbmVpZ2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTUzMjAsImV4cCI6MjA4NTIzMTMyMH0.NCyOpny7i2hKRr--kXvgrjxHDezpe5dhBSBXwZnPSUA'

export const supabase = createClient(supabaseUrl, supabaseKey)