import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrxdffccfcckntayrowi.supabase.co'; // Substitua pelo valor do seu projeto
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGRmZmNjZmNja250YXlyb3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzA3NDAsImV4cCI6MjA2NjIwNjc0MH0.httN0VBRObnWMaQFn9XyGZnErOLlYjJ1pgLjiZ-eN38'; // Substitua pelo valor do seu projeto

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 