import { redirect } from "next/navigation";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    "http://127.0.0.1:3000/api/auth/meta/callback";

  if (!appId) {
    redirect("/client-editor?meta=missing-app-id");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ["pages_show_list", "pages_read_engagement", "instagram_basic"].join(","),
    state: "lisa-client-editor",
  });

  redirect(`https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`);
}
