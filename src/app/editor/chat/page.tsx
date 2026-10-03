import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import ChatInbox from "./ChatInbox";

export default async function LiveChatPage() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/editor");
  }
  return <ChatInbox />;
}
