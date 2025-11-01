import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function uploadProfileImage(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    try {
        const { data: existingFiles, error: listError } = await supabase.storage
            .from('avatars')
            .list(userId);

        if (listError) throw listError;

        if (existingFiles && existingFiles.length > 0) {
            const filePathsToRemove = existingFiles.map(f => `${userId}/${f.name}`);
            const { error: removeError } = await supabase.storage
                .from('avatars')
                .remove(filePathsToRemove);
            if (removeError) throw removeError;
        }

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return `${data.publicUrl}?t=${Date.now()}`;
        
    } catch (err) {
        console.error("Error uploading profile image:", err);
        throw err;
    }
}
