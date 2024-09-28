import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mbtdsosqfwgbjkckfnzj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idGRzb3NxZndnYmprY2tmbnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0NTI2NjQsImV4cCI6MjA0MzAyODY2NH0.02yL1hKnSOwvhg-DxlPo24hQk1qf2gCBOemRFAUdN3M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)