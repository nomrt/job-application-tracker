import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Job Application Tracker</h1>
          <div className="flex items-center gap-2">
            <Input placeholder="Search…" className="w-64" />
            <Button>New</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600">
            UI kit is installed. Next we’ll build the applications table and connect to the Django API.
          </p>
        </Card>
      </main>
    </div>
  );
}
