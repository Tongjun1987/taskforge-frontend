import LabelPageClient from "./LabelPageClient";

export async function generateStaticParams() {
  return [];
}

export default function LabelPage() {
  return <LabelPageClient />;
}
