import { cookies } from "next/headers";
import EditorNav from "./EditorNav";
import { isOwnerSessionValid } from "@/lib/storefront-config";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <EditorNav />}
      {children}
    </div>
  );
}
