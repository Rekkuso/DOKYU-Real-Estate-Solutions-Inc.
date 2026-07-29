import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-3">
        404 — Page Not Found
      </h1>
      <p className="max-w-md text-gray-600 dark:text-gray-400 text-lg mb-8">
        Sorry, we couldn&apos;t find the property or page you were looking for. It may have been moved, removed, or doesn&apos;t exist.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/properties">
          <Button variant="outline" className="gap-2 px-6">
            Browse Properties
          </Button>
        </Link>
      </div>
    </div>
  );
}
