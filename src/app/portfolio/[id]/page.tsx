import PortfolioClient from "./portfolio-client";

export function generateStaticParams() {
  // Provide at least one dummy parameter so Next.js doesn't fail the export build
  return [{ id: "dummy" }];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <PortfolioClient id={params.id} />;
}
