import { requireAdmin } from "~/lib/session.server";
import { listUsedMedia } from "~/lib/media.server";
import { MediaGallery } from "~/components/admin/media-gallery";

export default async function MediaPage() {
  await requireAdmin();
  const items = await listUsedMedia();
  return <MediaGallery initialItems={items} />;
}
