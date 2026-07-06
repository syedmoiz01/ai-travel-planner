import { Suspense } from "react";

import { PlanContent } from "@/components/plan-content";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlanPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center px-4 py-10">
        <Suspense fallback={<Skeleton className="h-96 w-full max-w-3xl" />}>
          <PlanContent />
        </Suspense>
      </main>
    </div>
  );
}
