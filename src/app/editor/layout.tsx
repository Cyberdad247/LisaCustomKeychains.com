import EditorNav from "./EditorNav";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorNav />
      {children}
    </div>
  );
}
