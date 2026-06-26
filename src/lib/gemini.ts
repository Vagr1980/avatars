import { createClient as createSupabase } from "@supabase/supabase-js"
export async function generateCharacterAvatar(prompt: string, characterName: string) {
  const fullPrompt = encodeURIComponent("Portrait of " + characterName + ". " + prompt + ". Painterly illustration, soft lighting, detailed face, neutral background.")
  const url = "https://image.pollinations.ai/prompt/" + fullPrompt + "?width=512&height=512&nologo=true&model=flux"
  const response = await fetch(url)
  if (!response.ok) throw new Error("Pollinations error: " + response.status)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString("base64")
  return { base64, mimeType: "image/jpeg" }
}
export async function uploadAvatarToStorage(base64: string, mimeType: string, characterId: string) {
  const supabaseAdmin = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const buffer = Buffer.from(base64, "base64")
  const path = "characters/" + characterId + ".jpg"
  const { error } = await supabaseAdmin.storage.from("avatars").upload(path, buffer, { contentType: mimeType, upsert: true })
  if (error) throw new Error("Storage error: " + error.message)
  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(path)
  return data.publicUrl
}