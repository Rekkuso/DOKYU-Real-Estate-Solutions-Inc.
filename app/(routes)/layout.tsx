import Header from "../_components/Header";
import { getIsAdmin } from "../_actions/admin";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await getIsAdmin();

  return (
    <>
      <Header isAdmin={isAdmin} />
      {children}
    </>
  );
}
