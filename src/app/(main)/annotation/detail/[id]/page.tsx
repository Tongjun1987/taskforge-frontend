import AnnotationDetailClient from "./ClientPage";

export async function generateStaticParams() {
  return [
    { id: 'anno_expert_det' },
    { id: 'ds_traffic_det' },
    { id: 'anno_expert_mot' },
    { id: 'ds_traffic_mot' },
    { id: 'anno_expert_beh' },
    { id: 'ds_traffic_beh' },
    { id: 'anno_expert_event' },
    { id: 'ds_traffic_event' },
  ];
}

export default function AnnotationDetailPage() {
  return <AnnotationDetailClient />;
}
