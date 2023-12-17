import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
//const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient('https://zptmddtysjlwukmstjvh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdG1kZHR5c2psd3VrbXN0anZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIzODM5NTcsImV4cCI6MjAxNzk1OTk1N30.QzD1mq9gAlH77SwLRNXseYVhi_kkbO3Lg41PdtAzwnY')
export default supabase