import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCatalog } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-content";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function uploadCodeImages(formData: FormData) {
  "use server";
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length || files.some((file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES)) return;
  const admin = createAdminClient();
  if (!admin) return;
  const urls: string[] = [];
  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `code-gallery/code-${Date.now()}-${index}.${extension}`;
    const { error } = await admin.storage.from(BUCKET).upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: file.type });
    if (!error) urls.push(admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  if (urls.length) {
    const { data } = await admin.from("site_settings").select("value").eq("key", "code_gallery_images").maybeSingle();
    const existing = Array.isArray(data?.value) ? data.value.filter((value): value is string => typeof value === "string") : [];
    await admin.from("site_settings").upsert({ key: "code_gallery_images", value: [...existing, ...urls] });
  }
  revalidatePath("/");
  revalidatePath("/admin/code-gallery");
}

async function removeCodeImage(formData: FormData) {
  "use server";
  const imageUrl = String(formData.get("imageUrl") || "");
  const admin = createAdminClient();
  if (!admin || !imageUrl) return;
  const { data } = await admin.from("site_settings").select("value").eq("key", "code_gallery_images").maybeSingle();
  const existing = Array.isArray(data?.value) ? data.value.filter((value): value is string => typeof value === "string") : [];
  await admin.from("site_settings").upsert({ key: "code_gallery_images", value: existing.filter((value) => value !== imageUrl) });
  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const pathname = new URL(imageUrl).pathname;
    if (pathname.includes(marker)) await admin.storage.from(BUCKET).remove([decodeURIComponent(pathname.split(marker)[1])]);
  } catch {}
  revalidatePath("/");
  revalidatePath("/admin/code-gallery");
}

export default async function AdminCodeGalleryPage() {
  const { settings } = await fetchCatalog();
  return <main><section className="collection"><div className="collection__inner admin-content">
    <h1 className="collection__heading">The Code gallery</h1>
    <Link className="admin-nav-link" href="/admin">← Admin home</Link>
    <p className="about__text">Upload the images used in the rotating greyscale background. Keep each upload batch below 4 MB.</p>
    <form action={uploadCodeImages} className="admin-upload-card">
      <label>Choose images<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required /></label>
      <button className="admin-btn" type="submit">Upload images</button>
    </form>
    {settings.codeGalleryImages.length > 0 && <div className="admin-current-images">
      {settings.codeGalleryImages.map((src, index) => <figure className="admin-current-image" key={src}>
        <span className="admin-current-image__number">{index + 1}</span>
        <img src={src} alt={`The Code background ${index + 1}`} />
        <form action={removeCodeImage}><input type="hidden" name="imageUrl" value={src} /><button className="admin-btn" type="submit">Remove</button></form>
      </figure>)}
    </div>}
  </div></section></main>;
}
