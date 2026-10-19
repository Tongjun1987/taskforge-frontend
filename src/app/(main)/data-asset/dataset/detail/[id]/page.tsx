import DatasetDetailClient from "./DatasetDetailClient";

export async function generateStaticParams() {
  return [
    { id: 'traffic-ds-1' },
    { id: 'traffic-ds-2' },
    { id: 'traffic-ds-3' },
    { id: 'traffic-ds-4' },
    { id: 'ds_det_001' },
    { id: 'ds_track_001' },
    { id: 'ds_beh_001' },
    { id: 'ds_event_001' },
    { id: 'mgr-traffic-det' },
    { id: 'mgr-traffic-mot' },
    { id: 'mgr-traffic-beh' },
    { id: 'mgr-traffic-event' },
    { id: 'mgr-traffic-ts' },
    { id: 'mgr-001' },
    { id: 'mgr-002' },
    { id: 'mgr-003' },
    { id: 'mgr-004' },
    { id: 'mgr-005' },
    { id: 'mgr-006' },
  ];
}

export default function DatasetDetailPage() {
  return <DatasetDetailClient />;
}
