import CareerClient from "./career-client";

export function generateStaticParams() {
  // Provide at least one dummy parameter so Next.js doesn't fail the export build
  return [{ id: "dummy" }];
}

export default function Page() {
  return <CareerClient />;
}
