import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "../../_components/Header";

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

  // Check admin status from app_metadata
  const isAdmin = user?.app_metadata?.role === "admin";

  // Redirect non-admins
  if (!user || !isAdmin) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header isAdmin={isAdmin} />
      {children}
    </>
  );
}
