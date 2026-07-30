import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCatalog } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-content";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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

export default async function AdminContentPage() {
  const { settings } = await fetchCatalog();

  return (
    <main>
      <section className="collection">
        <div className="collection__inner admin-content">
          <h1 className="collection__heading">Customer feedback</h1>
          <Link className="admin-nav-link" href="/admin">← Admin home</Link>
          <p className="about__text">
            Upload any number of JPG, PNG, or WebP screenshots. Each image can be up to 8 MB.
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
                <img key={src} src={src} alt={`Customer feedback screenshot ${index + 1}`} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
