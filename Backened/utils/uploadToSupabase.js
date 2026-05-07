import { supabase } from "../config/supabaseClient.js";

export const uploadToSupabase = async (file) => {
  // File ka unique naam banayein
  const fileName = `${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from('project-files') // Jo bucket aapne banayi
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  // File ka Public URL hasil karein
  const { data: urlData } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};