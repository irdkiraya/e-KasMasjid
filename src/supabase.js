import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbtlnfxhealqcgerojnf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidGxuZnhoZWFscWNnZXJvam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0MzE0ODksImV4cCI6MjExMTAwNzQ4OX0.7bwRYwboiuNrKN_hyTmLB9IoaKDNXl3KNqMW0OnhSKc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)