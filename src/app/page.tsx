"use client";


import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/features/landing/components/Hero";
import dynamic from "next/dynamic";

const Features = dynamic(() => import("@/features/landing/components/Features").then((mod) => mod.Features));
const About = dynamic(() => import("@/features/landing/components/About").then((mod) => mod.About));
const CTA = dynamic(() => import("@/features/landing/components/CTA").then((mod) => mod.CTA));
const Contact = dynamic(() => import("@/features/landing/components/Contact").then((mod) => mod.Contact));
const SiteFooter = dynamic(() => import("@/components/layout/SiteFooter").then((mod) => mod.SiteFooter));



export default function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <About />
        <CTA />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}

