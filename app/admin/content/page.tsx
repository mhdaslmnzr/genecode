import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCatalog } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-content";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function uploadFeedbackImages(formData: FormData) {
  "use server";

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length || files.some((file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES)) return;

  const admin = createAdminClient();
  if (!admin) return;

  const uploadedUrls: string[] = [];
  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const storagePath = `feedback-${Date.now()}-${index}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });
    if (!error) uploadedUrls.push(admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl);
  }

  if (uploadedUrls.length) {
    const { data: row } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "testimonial_images")
      .maybeSingle();
    const existing = Array.isArray(row?.value)
      ? row.value.filter((value): value is string => typeof value === "string")
      : [];
    await admin
      .from("site_settings")
      .upsert({ key: "testimonial_images", value: [...existing, ...uploadedUrls] });
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
}

async function removeFeedbackImage(formData: FormData) {
  "use server";

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || !imageUrl) return;

  const admin = createAdminClient();
  if (!admin) return;

  const { data: row } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "testimonial_images")
    .maybeSingle();
  const existing = Array.isArray(row?.value)
    ? row.value.filter((value): value is string => typeof value === "string")
    : [];

  await admin
    .from("site_settings")
    .upsert({ key: "testimonial_images", value: existing.filter((value) => value !== imageUrl) });

  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const pathname = new URL(imageUrl).pathname;
    const storagePath = pathname.includes(marker)
      ? decodeURIComponent(pathname.split(marker)[1])
      : "";
    if (storagePath) await admin.storage.from(BUCKET).remove([storagePath]);
  } catch {
    // The database entry is still removed if an old external image URL is invalid.
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
}

export default async function AdminContentPage() {
  const { settings } = await fetchCatalog();

  return (
    <main>
      <section className="collection">
        <div className="collection__inner admin-content">
          <h1 className="collection__heading">Testimonials</h1>
          <Link className="admin-nav-link" href="/admin">← Admin home</Link>
          <section className="admin-content-section">
          <h2>Customer feedback</h2>
          <p className="about__text">
            Upload multiple JPG, PNG, or WebP screenshots. Keep the combined upload below 4 MB.
          </p>

          <form action={uploadFeedbackImages} className="admin-upload-card">
            <label>
              Choose screenshots
              <input
                type="file"
                name="images"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
              />
            </label>
            <button className="admin-btn" type="submit">Upload screenshots</button>
          </form>

          {settings.testimonialImages.length > 0 && (
            <div className="admin-current-images">
              {settings.testimonialImages.map((src, index) => (
                <figure className="admin-current-image" key={src}>
                  <span className="admin-current-image__number">{index + 1}</span>
                  <img src={src} alt={`Customer feedback screenshot ${index + 1}`} />
                  <form action={removeFeedbackImage}>
                    <input type="hidden" name="imageUrl" value={src} />
                    <button className="admin-btn" type="submit">Remove</button>
                  </form>
                </figure>
              ))}
            </div>
          )}
          </section>
        </div>
      </section>
    </main>
  );
}
