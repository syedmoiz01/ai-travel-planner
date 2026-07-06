import Image from "next/image";
import { Compass, Map, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { TripSearchForm } from "@/components/trip-search-form";

const HERO_IMG =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80";
const QUOTE_IMG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80";
const GALLERY_IMGS = [
  {
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    alt: "Lantern-lit street in Kyoto at dusk",
  },
  {
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    alt: "Paris rooftops with the Eiffel Tower",
  },
  {
    src: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
    alt: "Beach boardwalk between palm trees",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Crafted Itineraries",
    text: "A complete day-by-day plan — mornings to nights, restaurants included — generated for your style and budget in seconds.",
  },
  {
    icon: Map,
    title: "Real Local Insight",
    text: "Hotels, attractions, and live weather woven into every plan, so you land knowing exactly where to go.",
  },
  {
    icon: Compass,
    title: "Smarter Deals",
    text: "Price trends and booking guidance that tell you whether to book now or hold out for a better fare.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "It planned our week in Japan better than I could have with a month of research.",
    name: "Scott Lowe",
  },
  {
    quote:
      "Every restaurant it picked was a hit. We just followed the plan and had the best trip of our lives.",
    name: "The Robertsons",
  },
  {
    quote:
      "The budget estimates were spot on. No surprises — just a perfectly paced honeymoon.",
    name: "Jody and Tom Larson",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[560px] flex items-center justify-center">
        <Image
          src={HERO_IMG}
          alt="Snow-capped mountain above a forested lake"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4 space-y-6">
          <h1 className="font-heading font-bold text-5xl sm:text-7xl leading-tight max-w-3xl mx-auto">
            Plan Your Perfect Trip with AI
          </h1>
          <p className="text-lg font-light tracking-wide">
            Tell us where you want to go — get a complete itinerary in seconds
          </p>
          <a
            href="#planner"
            className="inline-block border border-white px-8 py-3 text-sm tracking-wide hover:bg-white hover:text-black transition-colors"
          >
            Let&apos;s Go
          </a>
        </div>
      </section>

      {/* Story */}
      <section className="bg-secondary text-secondary-foreground py-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl">
            This Is How It Works
          </h2>
          <p className="text-muted-foreground leading-7">
            Pick a destination, set your days, travelers, and budget, and choose
            the style of trip you&apos;re after. Our AI builds a complete
            morning-to-night itinerary — attractions, restaurants, costs, and
            packing tips — tailored to the way you travel.
          </p>
          <a
            href="#planner"
            className="inline-block border border-foreground px-8 py-3 text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
          >
            Start Planning
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-center mb-20">
            What Makes Us Special
          </h2>
          <div className="grid sm:grid-cols-3 gap-14 text-center">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="space-y-5">
                <Icon
                  strokeWidth={1}
                  className="size-12 mx-auto text-foreground"
                />
                <h3 className="font-heading font-bold text-xl">{title}</h3>
                <p className="text-sm text-muted-foreground leading-6 max-w-xs mx-auto">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planner */}
      <section id="planner" className="bg-secondary py-24 px-4 scroll-mt-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-bold text-4xl sm:text-5xl">
              Where To Next?
            </h2>
            <p className="text-muted-foreground">
              Answer a few questions and let the AI do the rest.
            </p>
          </div>
          <TripSearchForm />
        </div>
      </section>

      {/* Gallery */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {GALLERY_IMGS.map((img) => (
            <div key={img.src} className="relative aspect-[4/3]">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-center mb-20">
            Testimonials
          </h2>
          <div className="grid sm:grid-cols-3 gap-14 text-center">
            {TESTIMONIALS.map(({ quote, name }) => (
              <figure key={name} className="space-y-6">
                <blockquote className="font-heading font-bold text-xl leading-8">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm text-muted-foreground">
                  {name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="relative h-[50vh] min-h-[360px] flex items-center justify-center">
        <Image
          src={QUOTE_IMG}
          alt="Mountain range under a wide sky"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <p className="relative z-10 font-heading font-bold text-3xl sm:text-5xl text-white text-center px-4 max-w-3xl">
          &ldquo;Not all those who wander are lost.&rdquo;
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-center text-sm text-muted-foreground py-5">
        &copy; {new Date().getFullYear()} AI Travel Planner
      </footer>
    </div>
  );
}
