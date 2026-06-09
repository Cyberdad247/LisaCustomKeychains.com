import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import BlogEngine from "./BlogEngine";

export default async function BlogEnginePage() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }
  return <BlogEngine />;
}
