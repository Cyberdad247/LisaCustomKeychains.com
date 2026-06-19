import { describe, it, expect } from "vitest";

import {
  PopupEventSchema,
  newEventId,
  buildAddToCalendarUrl,
  type PopupEvent,
} from "../calendar";

describe("PopupEventSchema", () => {
  const valid: PopupEvent = {
    id: "evt-1",
    date: "2026-07-04",
    title: "Fourth of July Pop-Up",
    location: "Main Street",
  };

  it("accepts a valid event", () => {
    expect(() => PopupEventSchema.parse(valid)).not.toThrow();
  });

  it("rejects a malformed date", () => {
    expect(() => PopupEventSchema.parse({ ...valid, date: "07/04/2026" })).toThrow();
  });

  it("rejects an empty title", () => {
    expect(() => PopupEventSchema.parse({ ...valid, title: "" })).toThrow();
  });

  it("rejects an over-long title", () => {
    expect(() => PopupEventSchema.parse({ ...valid, title: "x".repeat(121) })).toThrow();
  });
});

describe("newEventId", () => {
  it("never collides with synced (ics-) ids", () => {
    expect(newEventId().startsWith("ics-")).toBe(false);
    expect(newEventId()).not.toBe(newEventId());
  });
});

describe("buildAddToCalendarUrl", () => {
  it("produces a Google Calendar event-edit link with the date range", () => {
    const url = buildAddToCalendarUrl({
      id: "evt-1",
      date: "2026-07-04",
      title: "Pop-Up",
      location: "Main St",
    });
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("dates=20260704%2F20260705");
    expect(url).toContain("text=Pop-Up");
  });
});
