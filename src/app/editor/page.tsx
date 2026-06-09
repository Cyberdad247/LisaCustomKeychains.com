import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ContentCalendar from "./ContentCalendar";
import TriagePanel from "./TriagePanel";
import { getUpcomingPopups } from "@/lib/calendar.server";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { logoutOwner } from "@/app/client-editor/actions";

export default async function OwnerDashboard() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }

  const events = await getUpcomingPopups();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-widest uppercase text-gray-900">
          Command{" "}
          <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
            Center
          </span>
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
              System Online
            </span>
          </div>
          <form action={logoutOwner}>
            <button className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContentCalendar />
        </div>

        <div className="space-y-6">
          <TriagePanel />

          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 border-b pb-2">
              Active Pop-Up Routing
            </h2>
            {events.length === 0 ? (
              <p className="text-xs text-gray-500">No upcoming events synced.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col bg-gray-50 p-3 border border-gray-100"
                  >
                    <span className="text-xs font-bold text-purple-900">
                      {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-sm text-gray-800">{event.title}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                      {event.location}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center text-[10px] uppercase tracking-widest text-gray-500 hover:text-purple-700 transition-colors"
            >
              Manage in Google Calendar →
            </a>
          </div>

          <div className="bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4 border-b pb-2">
              Quick Links
            </h2>
            <nav className="space-y-2">
              {[
                { label: "Social Studio", href: "/editor/social" },
                { label: "Blog Engine", href: "/editor/blog" },
                { label: "Ad Gallery", href: "/editor/ads" },
                { label: "Storefront Editor", href: "/client-editor" },
                { label: "Public Blog", href: "/blog" },
                { label: "Design Studio", href: "/customize" },
                { label: "Shopify Admin", href: "https://jgvme0-av.myshopify.com/admin" },
                { label: "Vercel Dashboard", href: "https://vercel.com/invisionedmarketing/lisa-custom-keychains-com" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block text-[11px] uppercase tracking-widest text-gray-500 hover:text-purple-700 transition-colors py-1"
                >
                  {label} →
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
