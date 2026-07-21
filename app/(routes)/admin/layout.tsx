import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIsAdmin } from "../../_actions/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check admin status from profiles table
  const isAdmin = await getIsAdmin();

  // Redirect non-admins
  if (!user || !isAdmin) {
    redirect("/dashboard");
  }

  return (
    <>
      {children}
    </>
  );
}
