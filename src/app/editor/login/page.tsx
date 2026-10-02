import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import EditorAuthPortal from "@/components/EditorAuthPortal";

export default async function EditorLoginPage() {
  const cookieStore = await cookies();
  if (isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/editor");
  }

  return <EditorAuthPortal redirectUrl="/editor" />;
}
