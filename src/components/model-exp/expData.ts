// ================================================================
// 数据中试中心 · 模型试验（训练评估 / 微调评估 / 推理评估）数据层
// 说明：数据集统一引用「数据发布中心 · 数据集管理」的登记对象，
//      中试只消费数据集，不重复定义数据口径。
// ================================================================
import { DATASETS, type Dataset } from "@/components/publish/publishData";

export type ExpStatus = "运行中" | "已完成" | "排队中" | "已终止";

export const EXP_STATUS_TONE: Record<ExpStatus, { tone: string; soft: string }> = {
  运行中: { tone: "#2563eb", soft: "#eff6ff" },
  已完成: { tone: "#16a34a", soft: "#f0fdf4" },
  排队中: { tone: "#b45309", soft: "#fffbeb" },
  已终止: { tone: "#dc2626", soft: "#fef2f2" },
};

// ---------------------------------------------------------------- 数据集引用
export const EXP_DATASETS = DATASETS.map((d) => ({
  id: d.id,
  name: d.name,
  dataType: d.dataType,
  scene: d.scene,
  domain: d.domain,
  scale: d.scale,
  score: d.quality.score,
  version: d.version,
}));

export function expDataset(id: string): Dataset | undefined {
  return DATASETS.find((d) => d.id === id);
}

// ---------------------------------------------------------------- 确定性曲线生成
// 静态导出阶段会在构建时先跑一遍，客户端再渲染一次；
// 若用 Math.random() 会造成 hydration mismatch，这里全部用确定性函数。
export function mkCurve(
  epochs: number,
  loss0: number,
  loss1: number,
  acc0: number,
  acc1: number,
  gap = 1.8,
  seed = 0
) {
  // gap 按 loss 尺度约束，避免 val_loss 反而高于初始值（看起来像全程没学动）
  const g = Math.min(gap, loss0 * 0.35);
  // seed 只影响收敛快慢与抖动相位：保证不同实验的曲线形态可区分，同时保持确定性
  const curve = 1.55 + (seed % 5) * 0.32;
  const phase = (seed % 7) * 0.9;
  const bias = 1 + ((seed % 3) - 1) * 0.1;
  return Array.from({ length: epochs }, (_, i) => {
    const t = epochs > 1 ? i / (epochs - 1) : 1;
    const e = 1 - Math.pow(1 - t, curve);
    const eV = 1 - Math.pow(1 - t, curve * 0.9);
    const wiggle = Math.sin(i * 1.7 + phase) * 0.018;
    const trainLoss = +(loss0 - (loss0 - loss1) * e + wiggle).toFixed(3);
    const valStart = loss0 * 1.02;
    const valEnd = (loss1 + g * 0.28) * bias;
    // 后期轻微上翘，体现 train-val 分叉（过拟合趋势）
    const tail = Math.max(0, t - 0.72) * g * 0.16;
    const valLoss = +(valStart - (valStart - valEnd) * eV + tail + Math.cos(i * 1.3) * 0.012).toFixed(3);
    const trainAcc = +(acc0 + (acc1 - acc0) * e + 0.35).toFixed(2);
    const valAcc = +(acc0 + (acc1 - acc0) * e - 0.55 - Math.sin(i * 1.1) * 0.25).toFixed(2);
    return { epoch: i + 1, trainLoss, valLoss, trainAcc, valAcc };
  });
}

// ================================================================
// 一、模型训练评估
// ================================================================
export type TrainMetric = { label: string; value: number; unit: string };

export type TrainExp = {
  id: string;
  name: string;
  datasetId: string;
  modelType: string;
  framework: string;
  preset: string;
  status: ExpStatus;
  progress: number;
  gpu: string;
  startedAt: string;
  duration: string;
  /** 列表主指标（准确率 / mAP@0.5 / 字符准确率 等） */
  mainLabel: string;
  mainValue: number;
  metrics: TrainMetric[];
  process: {
    bestEpoch: number;
    totalEpochs: number;
    earlyStop: boolean;
    earlyStopEpoch?: number;
    patience: number;
    trainAcc: number;
    valAcc: number;
    gap: number;
    overfit: "低" | "中" | "高";
    stopReason: string;
  };
  curves: { epoch: number; trainLoss: number; valLoss: number; trainAcc: number; valAcc: number }[];
  confusion?: { labels: string[]; matrix: number[][] };
  conclusion: string;
  advice: string[];
};

const C5 = ["行人", "非机动车", "机动车", "路面异常", "其他"];

export const TRAIN_EXPS: TrainExp[] = [
  {
    id: "TE-2026-014",
    name: "交通视频行为识别 · MMAction2 基线",
    datasetId: "DS-2026-101",
    modelType: "视频行为分类",
    framework: "PyTorch 2.3 + MMAction2",
    preset: "多模态/视频 · 标准化训练流程 v2",
    status: "运行中",
    progress: 68,
    gpu: "4 × A100 80G",
    startedAt: "2026-11-06 09:12",
    duration: "1h 46m",
    mainLabel: "准确率",
    mainValue: 90.4,
    metrics: [
      { label: "准确率", value: 90.4, unit: "%" },
      { label: "精确率", value: 88.9, unit: "%" },
      { label: "召回率", value: 87.6, unit: "%" },
    ],
    process: {
      bestEpoch: 34, totalEpochs: 60, earlyStop: false, patience: 8,
      trainAcc: 94.1, valAcc: 90.4, gap: 3.7, overfit: "中", stopReason: "训练进行中",
    },
    curves: mkCurve(41, 2.34, 0.42, 62.1, 90.4, 2.6, 3),
    conclusion: "训练仍在进行，当前 val_acc 90.4%，train-val 差距 3.7pt，处于可接受区间。",
    advice: ["夜间与雨雾片段召回偏低，建议补充该类场景样本后再跑一轮"],
  },
  {
    id: "TE-2026-013",
    name: "医疗影像结节检测 · nnU-Net",
    datasetId: "DS-2026-103",
    modelType: "图像语义分割",
    framework: "PyTorch 2.3 + MONAI",
    preset: "图像/语义分割 · 标准化训练流程 v2",
    status: "已完成",
    progress: 100,
    gpu: "2 × A100 80G",
    startedAt: "2026-11-05 14:20",
    duration: "3h 08m",
    mainLabel: "Dice",
    mainValue: 93.1,
    metrics: [
      { label: "Dice", value: 93.1, unit: "%" },
      { label: "精确率", value: 92.8, unit: "%" },
      { label: "召回率", value: 93.5, unit: "%" },
    ],
    process: {
      bestEpoch: 46, totalEpochs: 60, earlyStop: true, earlyStopEpoch: 54, patience: 8,
      trainAcc: 95.2, valAcc: 93.4, gap: 1.8, overfit: "低",
      stopReason: "早停触发：val_loss 连续 8 轮未下降",
    },
    curves: mkCurve(54, 1.86, 0.21, 68.4, 93.4, 1.8, 5),
    confusion: {
      labels: ["结节", "钙化", "囊肿", "正常组织", "背景"],
      matrix: [
        [612, 14, 9, 6, 2],
        [11, 468, 12, 4, 1],
        [7, 9, 391, 8, 2],
        [5, 3, 6, 874, 22],
        [2, 1, 2, 26, 1192],
      ],
    },
    conclusion:
      "Dice 93.1%、精确率 92.8% 达到预设门槛（≥ 90%），早停于第 54 轮，过拟合程度低，数据集可用于分割模型产线训练。",
    advice: [
      "囊肿与结节两类存在 9 例互误，建议在标注规范中补充「薄壁囊性结节」判定示例",
      "正常组织误判 22 例集中在扫描边缘，建议补充边缘区域负样本",
    ],
  },
  {
    id: "TE-2026-012",
    name: "工业图像缺陷分类 · ResNet50",
    datasetId: "DS-2026-105",
    modelType: "图像分类",
    framework: "PyTorch 2.3 + TIMM",
    preset: "图像/分类 · 标准化训练流程 v1",
    status: "已完成",
    progress: 100,
    gpu: "1 × A100 40G",
    startedAt: "2026-11-05 10:05",
    duration: "1h 12m",
    mainLabel: "准确率",
    mainValue: 91.2,
    metrics: [
      { label: "准确率", value: 91.2, unit: "%" },
      { label: "精确率", value: 90.4, unit: "%" },
      { label: "召回率", value: 89.7, unit: "%" },
    ],
    process: {
      bestEpoch: 38, totalEpochs: 50, earlyStop: true, earlyStopEpoch: 46, patience: 8,
      trainAcc: 96.8, valAcc: 91.2, gap: 5.6, overfit: "中",
      stopReason: "早停触发：val_loss 连续 8 轮未下降",
    },
    curves: mkCurve(46, 2.12, 0.38, 64.2, 91.2, 4.2, 2),
    confusion: {
      labels: ["划痕", "凹坑", "脏污", "裂纹", "合格"],
      matrix: [
        [402, 18, 6, 11, 4],
        [14, 356, 8, 6, 3],
        [5, 7, 288, 9, 12],
        [9, 5, 11, 341, 15],
        [3, 2, 14, 18, 806],
      ],
    },
    conclusion:
      "准确率 91.2%，但 train-val 差距 5.6pt，过拟合程度中等；划痕与裂纹存在 11 例互误，与两类标注边界模糊相关。",
    advice: [
      "划痕/裂纹标注边界不清，建议统一「长度 > 2mm 记为裂纹」的口径并返修 320 张",
      "建议将训练集扩充至 1.5 倍或开启强增强，压降过拟合差距至 3pt 以内",
    ],
  },
  {
    id: "TE-2026-011",
    name: "城市治理工单意图分类 · BERT-base",
    datasetId: "DS-2026-106",
    modelType: "文本分类",
    framework: "Transformers 4.42",
    preset: "文本/分类 · 标准化训练流程 v2",
    status: "已完成",
    progress: 100,
    gpu: "1 × A10 24G",
    startedAt: "2026-11-04 16:40",
    duration: "42m",
    mainLabel: "准确率",
    mainValue: 94.6,
    metrics: [
      { label: "准确率", value: 94.6, unit: "%" },
      { label: "精确率", value: 93.9, unit: "%" },
      { label: "召回率", value: 94.2, unit: "%" },
    ],
    process: {
      bestEpoch: 9, totalEpochs: 15, earlyStop: true, earlyStopEpoch: 12, patience: 3,
      trainAcc: 97.1, valAcc: 94.6, gap: 2.5, overfit: "低",
      stopReason: "早停触发：val_loss 连续 3 轮未下降",
    },
    curves: mkCurve(12, 1.42, 0.18, 71.8, 94.6, 2.4, 6),
    confusion: {
      labels: ["市容环境", "交通秩序", "设施报修", "噪音投诉", "咨询建议"],
      matrix: [
        [488, 16, 9, 12, 6],
        [13, 421, 7, 8, 5],
        [8, 6, 396, 4, 7],
        [11, 7, 5, 352, 9],
        [6, 4, 8, 10, 318],
      ],
    },
    conclusion:
      "准确率 94.6%、早停于第 12 轮，gap 仅 2.5pt，数据集质量满足文本分类训练要求。",
    advice: ["「咨询建议」类与「市容环境」类在长文本上有 10 例混淆，建议补充长工单样本"],
  },
  {
    id: "TE-2026-010",
    name: "语音转写校对 · Whisper-small",
    datasetId: "DS-2026-110",
    modelType: "语音识别",
    framework: "NeMo 2.1",
    preset: "音频/语音识别 · 标准化训练流程 v1",
    status: "已完成",
    progress: 100,
    gpu: "2 × A10 24G",
    startedAt: "2026-11-03 09:30",
    duration: "2h 26m",
    mainLabel: "字符准确率",
    mainValue: 96.3,
    metrics: [
      { label: "字符准确率", value: 96.3, unit: "%" },
      { label: "词错误率 WER", value: 8.4, unit: "%" },
      { label: "句准率", value: 91.8, unit: "%" },
    ],
    process: {
      bestEpoch: 22, totalEpochs: 30, earlyStop: true, earlyStopEpoch: 28, patience: 6,
      trainAcc: 98.1, valAcc: 96.3, gap: 1.8, overfit: "低",
      stopReason: "早停触发：val_loss 连续 6 轮未下降",
    },
    curves: mkCurve(28, 1.68, 0.24, 74.6, 96.3, 2.0, 1),
    conclusion: "字符准确率 96.3%，WER 8.4% 优于基线 11.2%，方言片段为主要错误来源。",
    advice: ["西南官话片段 WER 达 21.4%，建议单列方言子集并补充转写样本"],
  },
  {
    id: "TE-2026-009",
    name: "城市三维点云分割 · PointNet++",
    datasetId: "DS-2026-108",
    modelType: "点云语义分割",
    framework: "PyTorch3D 0.7",
    preset: "点云/语义分割 · 标准化训练流程 v1",
    status: "已终止",
    progress: 23,
    gpu: "4 × A100 80G",
    startedAt: "2026-11-02 15:10",
    duration: "38m",
    mainLabel: "mIoU",
    mainValue: 0,
    metrics: [],
    process: {
      bestEpoch: 0, totalEpochs: 40, earlyStop: false, patience: 8,
      trainAcc: 0, valAcc: 0, gap: 0, overfit: "低",
      stopReason: "显存溢出（CUDA OOM at iter 1,204），建议降采样体素尺寸后重跑",
    },
    curves: mkCurve(9, 3.42, 2.96, 22.4, 38.1, 6.4, 7),
    conclusion: "未产出可用结果：单样本点云 2,400 万点，4×A100 仍然 OOM，需先做体素降采样。",
    advice: ["建议在数据预处理环节增加体素下采样（0.02m → 0.05m）并重跑"],
  },
  {
    // 与 TE-2026-012 同模型类型（图像分类），用于「同一模型跨数据集」对照实验
    id: "TE-2026-008",
    name: "交通场景图像分类（视频抽帧）· ResNet50",
    datasetId: "DS-2026-101",
    modelType: "图像分类",
    framework: "PyTorch 2.3 + TIMM",
    preset: "图像/分类 · 标准化训练流程 v1",
    status: "已完成",
    progress: 100,
    gpu: "1 × A100 40G",
    startedAt: "2026-11-01 14:20",
    duration: "1h 26m",
    mainLabel: "准确率",
    mainValue: 89.7,
    metrics: [
      { label: "准确率", value: 89.7, unit: "%" },
      { label: "精确率", value: 88.2, unit: "%" },
      { label: "召回率", value: 87.1, unit: "%" },
    ],
    process: {
      bestEpoch: 36, totalEpochs: 50, earlyStop: true, earlyStopEpoch: 44, patience: 8,
      trainAcc: 93.8, valAcc: 89.7, gap: 4.1, overfit: "中",
      stopReason: "早停触发：val_loss 连续 8 轮未下降",
    },
    curves: mkCurve(44, 2.06, 0.36, 66.4, 89.7, 3.6, 4),
    confusion: {
      labels: ["行人", "机动车", "路况异常", "交通设施", "其他"],
      matrix: [
        [512, 22, 9, 6, 11],
        [19, 688, 12, 8, 9],
        [8, 14, 342, 11, 6],
        [7, 9, 8, 296, 12],
        [13, 8, 5, 14, 361],
      ],
    },
    conclusion:
      "同一 ResNet50 结构在交通抽帧图像上准确率 89.7%，低于工业缺陷集的 91.2%，主要差异来自「路况异常」类仅 381 例、样本不足。",
    advice: [
      "「路况异常」类样本量仅为其他类的 55%，建议补采至 800 例以上",
      "视频抽帧存在连续帧冗余，建议按场景去重后再入训练集",
    ],
  },
  {
    // 与 TE-2026-012 同模型类型（图像分类），用于「同一模型跨数据集」对照实验
    id: "TE-2026-007",
    name: "医疗影像良恶性分类 · ResNet50",
    datasetId: "DS-2026-103",
    modelType: "图像分类",
    framework: "PyTorch 2.3 + TIMM",
    preset: "图像/分类 · 标准化训练流程 v1",
    status: "已完成",
    progress: 100,
    gpu: "2 × A100 40G",
    startedAt: "2026-10-31 10:40",
    duration: "2h 04m",
    mainLabel: "准确率",
    mainValue: 88.4,
    metrics: [
      { label: "准确率", value: 88.4, unit: "%" },
      { label: "精确率", value: 87.6, unit: "%" },
      { label: "召回率", value: 86.9, unit: "%" },
    ],
    process: {
      bestEpoch: 41, totalEpochs: 50, earlyStop: true, earlyStopEpoch: 48, patience: 8,
      trainAcc: 91.6, valAcc: 88.4, gap: 3.2, overfit: "中",
      stopReason: "早停触发：val_loss 连续 8 轮未下降",
    },
    curves: mkCurve(48, 1.98, 0.41, 62.8, 88.4, 3.0, 8),
    confusion: {
      labels: ["正常", "结节", "钙化", "囊肿", "其他"],
      matrix: [
        [704, 26, 11, 9, 14],
        [31, 386, 14, 12, 9],
        [9, 12, 274, 8, 6],
        [11, 14, 7, 231, 10],
        [16, 9, 5, 11, 288],
      ],
    },
    conclusion:
      "同一 ResNet50 在医疗影像良恶性分类上准确率 88.4%，混淆集中在结节与囊肿之间（26 例），与两类影像表现接近有关。",
    advice: [
      "结节/囊肿互误 26 例，建议在标注规范中补充鉴别要点示例",
      "该数据集更适合做分割（见 TE-2026-013，Dice 93.1），分类任务建议先做病灶裁剪",
    ],
  },
];

// ================================================================
// 二、模型微调评估
// ================================================================
export type ScorePair = { task: string; before: number; after: number };

export type FinetuneExp = {
  id: string;
  name: string;
  baseModel: string;
  method: "全量微调" | "LoRA" | "QLoRA" | "DoRA";
  mix: { datasetId: string; ratio: number }[];
  status: ExpStatus;
  progress: number;
  gpu: string;
  startedAt: string;
  duration: string;
  tasks: ScorePair[];
  domain: { metric: string; before: number; after: number; note: string }[];
  forget: number;
  loss: number[];
  conclusion: string;
  feedback: { target: string; text: string; href: string }[];
};

export const FINETUNE_EXPS: FinetuneExp[] = [
  {
    id: "FT-2026-008",
    name: "医疗问答指令微调 · 6:4 配方",
    baseModel: "Qwen2.5-7B-Instruct",
    method: "LoRA",
    mix: [
      { datasetId: "DS-2026-109", ratio: 60 },
      { datasetId: "DS-2026-104", ratio: 40 },
    ],
    status: "已完成",
    progress: 100,
    gpu: "4 × A100 80G",
    startedAt: "2026-11-05 20:10",
    duration: "4h 36m",
    tasks: [
      { task: "医疗问答准确率", before: 62.4, after: 78.6 },
      { task: "病历摘要 ROUGE-L", before: 41.2, after: 49.8 },
      { task: "意图识别 F1", before: 84.1, after: 88.3 },
      { task: "通用指令跟随", before: 88.6, after: 87.1 },
    ],
    domain: [
      { metric: "医学术语命中率", before: 71.3, after: 89.4, note: "ICD-10 术语表抽样 800 条" },
      { metric: "领域知识问答", before: 58.2, after: 74.1, note: "自建医疗知识测试集 500 题" },
      { metric: "指南引用准确率", before: 44.6, after: 66.8, note: "对照临床指南条目" },
    ],
    forget: 1.5,
    loss: [2.42, 2.08, 1.84, 1.66, 1.52, 1.43, 1.36, 1.31, 1.27, 1.24, 1.22, 1.21],
    conclusion:
      "6:4 配方下医疗问答提升 16.2pt、领域知识注入 +15.9pt，通用能力仅回落 1.5pt，综合最优。",
    feedback: [
      { target: "数据标注质量", text: "问答对中有 3.1% 答案与指南版本不一致，建议返修后再入配方", href: "/quality" },
      { target: "数据分布", text: "儿科/急诊样本占比不足 6%，建议补采以均衡科室分布", href: "/data-publish" },
      { target: "数据配比", text: "该 6:4 配方可固化为医疗场景推荐配方模板", href: "/model-finetune" },
    ],
  },
  {
    id: "FT-2026-007",
    name: "城市治理工单指令微调 · 5:5 配方",
    baseModel: "Qwen2.5-7B-Instruct",
    method: "QLoRA",
    mix: [
      { datasetId: "DS-2026-106", ratio: 50 },
      { datasetId: "DS-2026-104", ratio: 50 },
    ],
    status: "已完成",
    progress: 100,
    gpu: "2 × A100 80G",
    startedAt: "2026-11-04 13:00",
    duration: "3h 12m",
    tasks: [
      { task: "工单要素抽取 F1", before: 74.8, after: 89.2 },
      { task: "处置建议生成", before: 61.4, after: 76.9 },
      { task: "派单部门命中率", before: 78.2, after: 91.4 },
      { task: "通用指令跟随", before: 88.6, after: 86.9 },
    ],
    domain: [
      { metric: "政务术语命中率", before: 68.9, after: 87.6, note: "政务事项目录抽样 600 条" },
      { metric: "政策条款引用", before: 52.1, after: 71.4, note: "地方条例条款匹配" },
    ],
    forget: 1.7,
    loss: [2.36, 2.02, 1.78, 1.61, 1.48, 1.39, 1.33, 1.28, 1.25, 1.23],
    conclusion: "派单部门命中率提升 13.2pt，工单要素抽取 F1 达 89.2，满足上线门槛。",
    feedback: [
      { target: "数据分布", text: "「设施报修」类占比 41%，建议压降至 30% 并补「噪音投诉」样本", href: "/data-publish" },
      { target: "数据标注质量", text: "派单部门标签有 2.4% 与实际处置部门不一致，建议按处置结果回标", href: "/quality" },
    ],
  },
  {
    id: "FT-2026-006",
    name: "交通视频描述微调 · 7:3 配方（多模态）",
    baseModel: "Qwen2-VL-7B-Instruct",
    method: "LoRA",
    mix: [
      { datasetId: "DS-2026-101", ratio: 70 },
      { datasetId: "DS-2026-102", ratio: 30 },
    ],
    status: "已完成",
    progress: 100,
    gpu: "8 × H20 96G",
    startedAt: "2026-11-03 21:30",
    duration: "6h 48m",
    tasks: [
      { task: "视频事件描述 BLEU-4", before: 28.4, after: 39.7 },
      { task: "关键要素召回", before: 66.2, after: 81.3 },
      { task: "事件类型判定", before: 72.6, after: 86.4 },
      { task: "通用指令跟随", before: 88.6, after: 86.2 },
    ],
    domain: [
      { metric: "交通事件术语命中", before: 64.1, after: 85.2, note: "交通事件分类标准抽样" },
      { metric: "时空描述准确率", before: 58.7, after: 73.9, note: "路段/时间要素核对" },
    ],
    forget: 2.4,
    loss: [2.68, 2.31, 2.04, 1.86, 1.72, 1.62, 1.55, 1.49, 1.45],
    conclusion: "事件描述 BLEU-4 提升 11.3，但通用能力回落 2.4pt，高于 2pt 警戒线，需追加通用样本。",
    feedback: [
      { target: "数据配比", text: "通用指令样本缺失导致能力回落，建议配方调整为 6:2:2（增 20% 通用）", href: "/model-finetune" },
      { target: "数据标注质量", text: "时空要素标注缺失率 7.8%，建议在标注模板中设为必填", href: "/smart-annotation" },
    ],
  },
  {
    id: "FT-2026-005",
    name: "医疗问答指令微调 · 3:7 配方",
    baseModel: "Qwen2.5-7B-Instruct",
    method: "LoRA",
    mix: [
      { datasetId: "DS-2026-109", ratio: 30 },
      { datasetId: "DS-2026-104", ratio: 70 },
    ],
    status: "已完成",
    progress: 100,
    gpu: "4 × A100 80G",
    startedAt: "2026-11-02 09:00",
    duration: "4h 12m",
    tasks: [
      { task: "医疗问答准确率", before: 62.4, after: 69.8 },
      { task: "病历摘要 ROUGE-L", before: 41.2, after: 44.1 },
      { task: "意图识别 F1", before: 84.1, after: 85.6 },
      { task: "通用指令跟随", before: 88.6, after: 88.4 },
    ],
    domain: [
      { metric: "医学术语命中率", before: 71.3, after: 78.2, note: "ICD-10 术语表抽样 800 条" },
      { metric: "领域知识问答", before: 58.2, after: 63.4, note: "自建医疗知识测试集 500 题" },
    ],
    forget: 0.3,
    loss: [2.44, 2.16, 1.98, 1.85, 1.76, 1.7, 1.66, 1.63],
    conclusion: "领域数据占比过低，医疗问答仅提升 7.4pt，领域注入效果有限。",
    feedback: [{ target: "数据配比", text: "医疗数据占比 30% 不足，建议上调至 60% 后重跑", href: "/model-finetune" }],
  },
  {
    id: "FT-2026-004",
    name: "应急事件研判微调 · 8:2 配方（DoRA）",
    baseModel: "Qwen2.5-14B-Instruct",
    method: "DoRA",
    mix: [
      { datasetId: "DS-2026-102", ratio: 80 },
      { datasetId: "DS-2026-106", ratio: 20 },
    ],
    status: "运行中",
    progress: 46,
    gpu: "8 × H20 96G",
    startedAt: "2026-11-06 08:40",
    duration: "2h 05m",
    tasks: [
      { task: "事件等级判定", before: 68.4, after: 79.1 },
      { task: "处置预案匹配", before: 57.2, after: 66.8 },
    ],
    domain: [{ metric: "应急预案术语命中", before: 62.8, after: 74.6, note: "应急预案库抽样 400 条" }],
    forget: 0,
    loss: [2.21, 1.94, 1.78, 1.68, 1.61],
    conclusion: "训练进行中，当前事件等级判定已提升 10.7pt。",
    feedback: [],
  },
];

// 数据配比对照实验（同一基础模型、同一评测集）
export const MIX_COMPARE = {
  baseModel: "Qwen2.5-7B-Instruct",
  evalSet: "医疗下游任务集（3 项）+ 通用能力集（1 项）",
  rows: [
    { id: "FT-2026-005", mix: "3 : 7", domainRatio: 30, avgGain: 5.1, best: "医疗问答 +7.4", forget: 0.3, cost: "4h 12m", score: 68.2 },
    { id: "FT-2026-008", mix: "6 : 4", domainRatio: 60, avgGain: 13.5, best: "医疗问答 +16.2", forget: 1.5, cost: "4h 36m", score: 86.4 },
    { id: "FT-2026-009", mix: "8 : 2", domainRatio: 80, avgGain: 10.2, best: "医疗问答 +14.1", forget: 4.8, cost: "4h 40m", score: 79.6 },
  ],
  conclusion:
    "领域数据占比 60% 时综合得分最高（86.4），继续提升至 80% 会因通用能力回落抵消收益。建议 6:4 作为医疗场景推荐配方。",
};

// ================================================================
// 三、模型推理评估
// ================================================================
export type InferExp = {
  id: string;
  name: string;
  model: string;
  modelVersion: string;
  datasetId: string;
  engine: string;
  device: string;
  concurrency: number;
  batch: number;
  samples: number;
  status: ExpStatus;
  progress: number;
  startedAt: string;
  perf: { p50: number; p95: number; p99: number; qps: number; gpuMem: number; accuracy: number; accuracyLabel: string };
  robust: { type: string; acc: number; drop: number }[];
  latency: { concurrency: number; p95: number; qps: number }[];
  conclusion: string;
  advice: string[];
};

export const INFER_EXPS: InferExp[] = [
  {
    id: "IE-2026-021",
    name: "医疗问答模型推理评估 · v3 权重",
    model: "Qwen2.5-7B-Instruct-med",
    modelVersion: "v3.0",
    datasetId: "DS-2026-109",
    engine: "vLLM 0.6.3",
    device: "1 × A100 80G",
    concurrency: 16,
    batch: 8,
    samples: 2000,
    status: "已完成",
    progress: 100,
    startedAt: "2026-11-06 09:00",
    perf: { p50: 322, p95: 684, p99: 946, qps: 42.6, gpuMem: 62.4, accuracy: 78.6, accuracyLabel: "问答准确率" },
    robust: [
      { type: "原始测试集", acc: 78.6, drop: 0 },
      { type: "对抗样本（改写攻击）", acc: 71.2, drop: 7.4 },
      { type: "高斯噪声 σ=0.05", acc: 76.9, drop: 1.7 },
      { type: "随机遮挡 20%", acc: 74.3, drop: 4.3 },
      { type: "错别字扰动 5%", acc: 69.8, drop: 8.8 },
    ],
    latency: [
      { concurrency: 1, p95: 214, qps: 6.2 },
      { concurrency: 4, p95: 318, qps: 21.4 },
      { concurrency: 8, p95: 452, qps: 34.1 },
      { concurrency: 16, p95: 684, qps: 42.6 },
      { concurrency: 32, p95: 1286, qps: 44.8 },
      { concurrency: 64, p95: 2418, qps: 45.1 },
    ],
    conclusion:
      "P95 684ms / 吞吐 42.6 QPS，满足在线问答 1s 内响应要求；准确率 78.6% 与训练评估一致，未见推理侧精度损失。",
    advice: [
      "错别字扰动下降 8.8pt，为最敏感维度，建议测试集补充错别字/口语化样本",
      "并发 32 后吞吐饱和（44.8 QPS），在线服务建议并发上限设为 24",
    ],
  },
  {
    id: "IE-2026-020",
    name: "交通行为识别模型推理评估 · TensorRT",
    model: "YOLOv8-traffic",
    modelVersion: "v2.1",
    datasetId: "DS-2026-101",
    engine: "TensorRT 10.3",
    device: "1 × A100 40G",
    concurrency: 8,
    batch: 16,
    samples: 5000,
    status: "已完成",
    progress: 100,
    startedAt: "2026-11-05 17:20",
    perf: { p50: 18, p95: 28, p99: 41, qps: 512.4, gpuMem: 18.6, accuracy: 91.4, accuracyLabel: "mAP@0.5" },
    robust: [
      { type: "原始测试集", acc: 91.4, drop: 0 },
      { type: "对抗样本（FGSM）", acc: 82.6, drop: 8.8 },
      { type: "高斯噪声 σ=0.05", acc: 89.7, drop: 1.7 },
      { type: "随机遮挡 20%", acc: 84.2, drop: 7.2 },
      { type: "夜间/低照度", acc: 76.8, drop: 14.6 },
    ],
    latency: [
      { concurrency: 1, p95: 9, qps: 108.2 },
      { concurrency: 4, p95: 16, qps: 286.4 },
      { concurrency: 8, p95: 28, qps: 512.4 },
      { concurrency: 16, p95: 52, qps: 618.2 },
      { concurrency: 32, p95: 96, qps: 664.8 },
    ],
    conclusion: "P95 28ms、吞吐 512 QPS，视频流实时分析达标；低照度场景 mAP 下降 14.6pt 为最大短板。",
    advice: [
      "夜间/低照度下降 14.6pt，建议数据集补充夜间片段并做亮度增强",
      "TensorRT INT8 量化后精度损失 0.8pt，可上线",
    ],
  },
  {
    id: "IE-2026-019",
    name: "工业缺陷分类推理评估 · ONNXRuntime",
    model: "ResNet50-defect",
    modelVersion: "v1.4",
    datasetId: "DS-2026-105",
    engine: "ONNXRuntime 1.19",
    device: "1 × T4 16G",
    concurrency: 16,
    batch: 32,
    samples: 3000,
    status: "已完成",
    progress: 100,
    startedAt: "2026-11-05 11:40",
    perf: { p50: 7, p95: 12, p99: 19, qps: 1240.6, gpuMem: 4.2, accuracy: 90.8, accuracyLabel: "准确率" },
    robust: [
      { type: "原始测试集", acc: 90.8, drop: 0 },
      { type: "高斯噪声 σ=0.05", acc: 88.9, drop: 1.9 },
      { type: "随机遮挡 20%", acc: 86.1, drop: 4.7 },
      { type: "亮度扰动 ±30%", acc: 84.6, drop: 6.2 },
      { type: "分辨率降采样 1/2", acc: 87.3, drop: 3.5 },
    ],
    latency: [
      { concurrency: 1, p95: 5, qps: 196.4 },
      { concurrency: 4, p95: 6, qps: 682.1 },
      { concurrency: 16, p95: 12, qps: 1240.6 },
      { concurrency: 32, p95: 21, qps: 1486.2 },
    ],
    conclusion: "P95 12ms、吞吐 1240 QPS，产线节拍（≥ 800 QPS）满足；亮度扰动下降 6.2pt 需关注。",
    advice: ["产线补光差异导致亮度扰动下降 6.2pt，建议标注时同步记录工位照度"],
  },
  {
    id: "IE-2026-018",
    name: "工单意图分类推理评估 · CPU 部署",
    model: "BERT-ticket-cls",
    modelVersion: "v1.2",
    datasetId: "DS-2026-106",
    engine: "ONNXRuntime 1.19",
    device: "16 vCPU",
    concurrency: 8,
    batch: 8,
    samples: 2500,
    status: "已完成",
    progress: 100,
    startedAt: "2026-11-04 15:10",
    perf: { p50: 28, p95: 46, p99: 72, qps: 196.4, gpuMem: 0, accuracy: 94.2, accuracyLabel: "准确率" },
    robust: [
      { type: "原始测试集", acc: 94.2, drop: 0 },
      { type: "错别字扰动 5%", acc: 90.1, drop: 4.1 },
      { type: "长文本截断 512", acc: 91.6, drop: 2.6 },
      { type: "口语化改写", acc: 87.4, drop: 6.8 },
    ],
    latency: [
      { concurrency: 1, p95: 21, qps: 48.2 },
      { concurrency: 4, p95: 32, qps: 124.6 },
      { concurrency: 8, p95: 46, qps: 196.4 },
      { concurrency: 16, p95: 88, qps: 214.2 },
    ],
    conclusion: "纯 CPU 部署下 P95 46ms、196 QPS，无需 GPU 即可支撑市级工单接入。",
    advice: ["口语化改写下降 6.8pt，建议测试集补充市民口语表达样本"],
  },
  {
    id: "IE-2026-017",
    name: "应急多模态研判推理评估 · 双卡",
    model: "Qwen2-VL-7B-emergency",
    modelVersion: "v0.9",
    datasetId: "DS-2026-102",
    engine: "vLLM 0.6.3",
    device: "2 × H20 96G",
    concurrency: 8,
    batch: 4,
    samples: 1200,
    status: "运行中",
    progress: 55,
    startedAt: "2026-11-06 10:20",
    perf: { p50: 1420, p95: 2860, p99: 3940, qps: 8.6, gpuMem: 148.2, accuracy: 72.4, accuracyLabel: "事件判定准确率" },
    robust: [
      { type: "原始测试集", acc: 72.4, drop: 0 },
      { type: "高斯噪声 σ=0.05", acc: 70.1, drop: 2.3 },
      { type: "随机遮挡 20%", acc: 66.8, drop: 5.6 },
    ],
    latency: [
      { concurrency: 1, p95: 1180, qps: 1.1 },
      { concurrency: 4, p95: 1920, qps: 4.6 },
      { concurrency: 8, p95: 2860, qps: 8.6 },
    ],
    conclusion: "评估进行中，多模态推理延迟偏高（P95 2.86s），需评估是否满足实时研判要求。",
    advice: [],
  },
  {
    id: "IE-2026-016",
    name: "语音转写推理评估 · faster-whisper",
    model: "Whisper-small-zh",
    modelVersion: "v2.0",
    datasetId: "DS-2026-110",
    engine: "faster-whisper 1.0",
    device: "1 × A10 24G",
    concurrency: 8,
    batch: 8,
    samples: 1500,
    status: "已完成",
    progress: 100,
    startedAt: "2026-11-03 20:00",
    perf: { p50: 420, p95: 780, p99: 1120, qps: 18.4, gpuMem: 6.8, accuracy: 96.1, accuracyLabel: "字符准确率" },
    robust: [
      { type: "原始测试集", acc: 96.1, drop: 0 },
      { type: "高斯噪声 σ=0.05", acc: 91.2, drop: 4.9 },
      { type: "8kHz 降采样", acc: 88.6, drop: 7.5 },
      { type: "背景人声干扰", acc: 84.2, drop: 11.9 },
    ],
    latency: [
      { concurrency: 1, p95: 380, qps: 2.6 },
      { concurrency: 4, p95: 596, qps: 11.2 },
      { concurrency: 8, p95: 780, qps: 18.4 },
      { concurrency: 16, p95: 1460, qps: 20.1 },
    ],
    conclusion: "字符准确率 96.1% 与训练评估一致；背景人声干扰下降 11.9pt，为转写质量主因。",
    advice: ["背景人声场景建议前置降噪；8kHz 录音质量需在采集端约束"],
  },
];

// ---------------------------------------------------------------- 选项字典
export const MODEL_TYPES = [
  "视频行为分类", "图像分类", "图像语义分割", "目标检测",
  "文本分类", "序列标注", "语音识别", "点云语义分割", "时序预测",
];

export const TRAIN_FRAMEWORKS = [
  "PyTorch 2.3 + MMAction2",
  "PyTorch 2.3 + MONAI",
  "PyTorch 2.3 + TIMM",
  "PyTorch 2.3 + Ultralytics",
  "PyTorch 2.3 + PaddleOCR",
  "PyTorch3D 0.7",
  "Transformers 4.42",
  "NeMo 2.1",
  "PyTorch-Forecasting 1.4",
];

export const TRAIN_PRESETS = [
  "图像/分类 · 标准化训练流程 v1",
  "图像/语义分割 · 标准化训练流程 v2",
  "文本/分类 · 标准化训练流程 v2",
  "多模态/视频 · 标准化训练流程 v2",
  "音频/语音识别 · 标准化训练流程 v1",
  "点云/语义分割 · 标准化训练流程 v1",
];

export const BASE_MODELS = [
  "Qwen2.5-7B-Instruct", "Qwen2.5-14B-Instruct", "Qwen2-VL-7B-Instruct",
  "DeepSeek-V2.5", "LLaMA-3-8B", "ChatGLM4-9B", "InternLM2.5-7B",
];

export const FINETUNE_METHODS = ["LoRA", "QLoRA", "DoRA", "全量微调"] as const;

export const WHAT_TO_EVAL = [
  "下游任务准确率", "下游任务 F1", "生成质量 BLEU / ROUGE",
  "领域术语命中率", "领域知识问答", "通用能力保持",
];

export const FINETUNE_TASKS = [
  "医疗问答准确率", "病历摘要 ROUGE-L", "意图识别 F1", "工单要素抽取 F1",
  "处置建议生成", "事件等级判定", "领域术语命中率", "通用指令跟随",
];

export const TRAINED_MODELS = [
  { name: "Qwen2.5-7B-Instruct-med", version: "v3.0", type: "文本生成", from: "FT-2026-008", size: "14.2 GB" },
  { name: "YOLOv8-traffic", version: "v2.1", type: "目标检测", from: "TE-2026-014", size: "268 MB" },
  { name: "ResNet50-defect", version: "v1.4", type: "图像分类", from: "TE-2026-012", size: "98 MB" },
  { name: "BERT-ticket-cls", version: "v1.2", type: "文本分类", from: "TE-2026-011", size: "412 MB" },
  { name: "Qwen2-VL-7B-emergency", version: "v0.9", type: "多模态理解", from: "FT-2026-006", size: "16.8 GB" },
  { name: "Whisper-small-zh", version: "v2.0", type: "语音识别", from: "TE-2026-010", size: "1.6 GB" },
];

export const INFER_ENGINES = ["vLLM 0.6.3", "TensorRT 10.3", "ONNXRuntime 1.19", "faster-whisper 1.0", "Transformers 4.42"];

export const INFER_DEVICES = ["1 × A100 80G", "2 × A100 80G", "1 × A100 40G", "1 × H20 96G", "2 × H20 96G", "1 × A10 24G", "1 × T4 16G", "16 vCPU"];

export const ROBUST_TYPES = ["对抗样本", "高斯噪声", "随机遮挡", "亮度扰动", "降采样", "错别字扰动", "背景干扰"];

// ---------------------------------------------------------------- 聚合指标
export function avg(nums: number[]) {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

export function finetuneGain(exp: FinetuneExp) {
  const gains = exp.tasks.filter((t) => !t.task.includes("通用")).map((t) => t.after - t.before);
  return avg(gains);
}

export function mixLabel(mix: { datasetId: string; ratio: number }[]) {
  const names = mix.map((m) => expDataset(m.datasetId)?.name?.replace("数据集", "") || m.datasetId);
  return `${mix.map((m) => m.ratio).join(" : ")}（${names.join(" / ")}）`;
}
