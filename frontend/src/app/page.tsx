import { SiteHeader } from "@/components/site-header";
import { TripSearchForm } from "@/components/trip-search-form";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-4 py-16">
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight">
            Plan Your Perfect Trip with AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us where you want to go, and get a complete day-by-day
            itinerary in seconds.
          </p>
        </div>

        <TripSearchForm />
      </main>
    </div>
  );
}
