import Header from "../_components/Header";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <>
      <Header isAdmin={isAdmin} />
      {children}
    </>
  );
}
