import LabelPageClient from "./LabelPageClient";

export async function generateStaticParams() {
  return [
    { id: 'mock_text_classify_001' },
    { id: 'mock_ner_001' },
    { id: 'mock_relation_001' },
    { id: 'mock_sentiment_001' },
    { id: 'mock_qa_001' },
    { id: 'mock_rect_001' },
    { id: 'mock_polygon_001' },
    { id: 'mock_keypoint_001' },
    { id: 'mock_ocr_001' },
    { id: 'mock_imgcls_001' },
    { id: 'mock_track_001' },
    { id: 'mock_segment_001' },
    { id: 'mock_event_001' },
    { id: 'mock_audio_001' },
    { id: 'mock_pointcloud_001' },
    { id: 'mock_multimodal_001' },
    { id: 'mock_sft_001' },
    { id: 'mock_dpo_001' },
    { id: 'mock_ppo_001' },
    { id: 'mock_cot_001' },
    { id: 'mock_tot_001' },
    { id: 'mock_got_001' },
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

export default function LabelPage() {
  return <LabelPageClient />;
}
