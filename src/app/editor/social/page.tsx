import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import SocialStudio from "./SocialStudio";

export default async function SocialStudioPage() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }
  return <SocialStudio />;
}
