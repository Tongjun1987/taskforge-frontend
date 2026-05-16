import CleaningDetailClient from "./CleaningDetailClient";

export async function generateStaticParams() {
  return [
    { id: 'cl-traffic-det' },
    { id: 'cl-traffic-mot' },
    { id: 'cl-traffic-beh' },
    { id: 'cl-traffic-event' },
    { id: 'cl-traffic-timeseries' },
  ];
}

export default function CleaningDetailPage() {
  return <CleaningDetailClient />;
}
