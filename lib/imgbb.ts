export async function uploadToImgBB(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY?.trim();
  if (!key) {
    throw new Error(
      "Image upload is not configured. Set NEXT_PUBLIC_IMGBB_KEY and redeploy.",
    );
  }

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      body: form,
    },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success || !data?.data?.url) {
    const detail =
      data?.error?.message ||
      data?.error?.context ||
      data?.status_txt ||
      `Image upload failed (${res.status})`;
    throw new Error(detail);
  }

  return data.data.url as string;
}