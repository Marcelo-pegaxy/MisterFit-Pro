// Stub for UploadFile integration. Replace with real implementation as needed.

import { createClient } from '@supabase/supabase-js';

// Configure com suas variáveis de ambiente do frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function UploadFile({ file }) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `profile-photos/${fileName}`;

  // Upload para o bucket 'profile-photos'
  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  // Pega a URL pública do arquivo
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  return { file_url: data.publicUrl };
}