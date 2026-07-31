/**
 * Internal helpers for listing actions.
 * Not exported from the barrel — these are implementation details.
 */

import { revalidatePath } from "next/cache";

export function revalidateAllListingPaths(id?: number) {
  try {
    revalidatePath("/properties");
    revalidatePath("/admin");
    revalidatePath("/", "layout");
    if (id) {
      revalidatePath(`/properties/${id}`);
    }
  } catch (e) {
    console.error("Revalidation error:", e);
  }
}

export function extractListingData(formData: FormData) {
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw.replace(/,/g, "")) : 0;
  const beds = parseInt(formData.get("beds") as string) || 0;
  const baths = parseInt(formData.get("baths") as string) || 0;

  const isDraft = formData.get("isDraft") === "true";

  return {
    title: (formData.get("title") as string) || "",
    location: (formData.get("location") as string) || "",
    address: (formData.get("address") as string) || "",
    price: price,
    beds: beds,
    baths: baths,
    area: (formData.get("area") as string) || "",
    type: (formData.get("type") as string) || "Houses",
    tag: (formData.get("tag") as string) || "New",
    active: !isDraft,
  };
}
