"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function addListing(formData: FormData) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (userId !== "user_3G76YXPOMb0ZV854emeXLYHdFyV") {
    throw new Error("Unauthorized. Only the admin can add listings.");
  }

  // 2. Extract and format data
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw.replace(/,/g, "")) : 0;
  const beds = parseInt(formData.get("beds") as string) || 0;
  const baths = parseInt(formData.get("baths") as string) || 0;

  // Generate a random gradient for the mock image if not provided
  const gradients = [
    "from-blue-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-orange-500 to-rose-500",
    "from-purple-600 to-pink-600",
    "from-cyan-600 to-blue-600",
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  const listingData = {
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    address: formData.get("address") as string,
    price: price,
    beds: beds,
    baths: baths,
    area: formData.get("area") as string,
    type: formData.get("type") as string || "Houses",
    tag: formData.get("tag") as string || "New",
    gradient: gradient,
    date: new Date().toISOString().split("T")[0],
    active: true,
  };

  // 3. Connect to Supabase using Service Role Key (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 4. Insert data
  const { error } = await supabase.from("listing").insert([listingData]);

  if (error) {
    console.error("Error adding listing:", error);
    throw new Error("Failed to add listing to database.");
  }

  return { success: true };
}
