import EditDatasetClient from "./EditDatasetClient";

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
  ];
}

export default function EditDatasetPage() {
  return <EditDatasetClient />;
}
