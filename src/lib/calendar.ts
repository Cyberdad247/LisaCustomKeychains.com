import { readFile } from "fs/promises";
import path from "path";

export type PopupEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
};

export async function getUpcomingPopups(): Promise<PopupEvent[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "events.json");
    const raw = await readFile(filePath, "utf-8");
    const events: PopupEvent[] = JSON.parse(raw);
    const now = new Date();
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [];
  }
}
