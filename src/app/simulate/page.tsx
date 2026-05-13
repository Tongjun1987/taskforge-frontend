/**
 * 交通事件识别全流程仿真数据注入
 *
 * 覆盖以下 localStorage key：
 *   - taskforge_scenes       任务建模场景
 *   - taskforge_tasks        任务建模任务
 *   - taskforge_datasets_access  数据接入
 *   - taskforge_cleaning_jobs    数据清洗
 *   - taskforge_datasets      数据集管理
 *   - taskforge_annotation_jobs  专家标注
 *   - taskforge_smart_annotation_jobs  智能标注
 *   - taskforge_version_history    版本历史
 *   - taskforge_models        模型仓库
 *   - taskforge_training_jobs     模型训练
 *   - taskforge_eval_jobs     模型评测
 *   - taskforge_test_jobs     模型测试
 *   - taskforge_knowledge_bases   知识库
 *   - taskforge_agents        智能体
 *   - taskforge_prompts       Prompt模板
 *
 * 运行方式：在浏览器控制台（F12）粘贴运行
 */

(function() {
  const now = "2026-04-20";
  const ts  = "2026-04-20T14:00:00Z";

  // ================================================================
  // 1. 任务建模 - 交通事件识别场景
  // ================================================================
  localStorage.setItem("taskforge_scenes", JSON.stringify([
    {
      id: "scene-traffic",
      name: "交通事件识别",
      description: "基于视频/图像的交通事故、拥堵、行人闯入等交通事件实时检测与分类",
      task_count: 4,
      dataset_count: 4,
      status: "active",
      created_at: "2026-04-01",
      tags: ["视频", "图像", "目标检测", "图像分类", "多模态"]
    }
  ]));

  localStorage.setItem("taskforge_tasks", JSON.stringify([
    {
      id: "task-traffic-1",
      scene_id: "scene-traffic",
      name: "交通事故检测",
      description: "检测监控画面中是否存在交通事故发生，包括车辆碰撞、侧翻、追尾等形态",
      type: "目标检测",
      dataset_count: 2,
      dataset_names: ["交通事故检测数据集", "事故严重程度评估数据集"],
      annotation_type: "矩形框+类别标签",
      quality_target: "Kappa ≥ 0.85",
      status: "active",
      created_at: "2026-04-01",
      progress: 72,
      annotation_progress: 68,
      quality_status: "passed"
    },
    {
      id: "task-traffic-2",
      scene_id: "scene-traffic",
      name: "事件类型分类",
      description: "将交通事件按类型分类：事故、拥堵、行人、闯红灯、逆行、异常停车等7类",
      type: "图像分类",
      dataset_count: 1,
      dataset_names: ["交通事件分类数据集"],
      annotation_type: "多标签分类",
      quality_target: "准确率 ≥ 90%",
      status: "active",
      created_at: "2026-04-01",
      progress: 85,
      annotation_progress: 80,
      quality_status: "passed"
    },
    {
      id: "task-traffic-3",
      scene_id: "scene-traffic",
      name: "车辆轨迹跟踪",
      description: "在连续帧中对车辆进行多目标跟踪，输出车辆ID、位置、速度、方向",
      type: "多目标跟踪",
      dataset_count: 1,
      dataset_names: ["车辆轨迹跟踪数据集"],
      annotation_type: "多目标跟踪框",
      quality_target: "MOTA ≥ 0.75",
      status: "active",
      created_at: "2026-04-02",
      progress: 45,
      annotation_progress: 40,
      quality_status: "pending"
    },
    {
      id: "task-traffic-4",
      scene_id: "scene-traffic",
      name: "事故严重程度评估",
      description: "根据事故图像评估事故严重程度：轻微、一般、严重、特别严重",
      type: "图像分类",
      dataset_count: 1,
      dataset_names: ["事故严重程度评估数据集"],
      annotation_type: "等级标注",
      quality_target: "Kappa ≥ 0.80",
      status: "active",
      created_at: "2026-04-03",
      progress: 30,
      annotation_progress: 25,
      quality_status: "unchecked"
    }
  ]));

  // ================================================================
  // 2. 数据接入
  // ================================================================
  localStorage.setItem("taskforge_datasets_access", JSON.stringify([
    {
      id: "access-001",
      name: "G15沈海高速监控接入",
      source_type: "流式接入",
      protocol: "RTSP",
      location: "G15沈海高速K1200-K1350段",
      camera_count: 48,
      total_items: 2450000,
      success_items: 2380000,
      failed_items: 70000,
      success_rate: 97.1,
      status: "running",
      created_at: "2026-04-01",
      updated_at: ts,
      task_name: "交通事故检测",
      scene_name: "交通事件识别"
    },
    {
      id: "access-002",
      name: "城市道路卡口数据",
      source_type: "结构化接入",
      protocol: "API",
      location: "上海市浦东新区",
      camera_count: 120,
      total_items: 560000,
      success_items: 554000,
      failed_items: 6000,
      success_rate: 98.9,
      status: "running",
      created_at: "2026-04-02",
      updated_at: ts,
      task_name: "事件类型分类",
      scene_name: "交通事件识别"
    },
    {
      id: "access-003",
      name: "事故档案历史照片导入",
      source_type: "本地上传",
      protocol: "local",
      location: "上海市交管局",
      camera_count: 0,
      total_items: 2800,
      success_items: 2765,
      failed_items: 35,
      success_rate: 98.8,
      status: "completed",
      created_at: "2026-04-05",
      updated_at: ts,
      task_name: "事故严重程度评估",
      scene_name: "交通事件识别"
    },
    {
      id: "access-004",
      name: "高德浮动车GPS数据",
      source_type: "半结构化接入",
      protocol: "Kafka",
      location: "全国高速路网",
      camera_count: 0,
      total_items: 12800000,
      success_items: 12640000,
      failed_items: 160000,
      success_rate: 98.8,
      status: "running",
      created_at: "2026-04-06",
      updated_at: ts,
      task_name: "车辆轨迹跟踪",
      scene_name: "交通事件识别"
    }
  ]));

  // ================================================================
  // 3. 数据清洗任务
  // ================================================================
  localStorage.setItem("taskforge_cleaning_jobs", JSON.stringify([
    {
      id: "clean-001",
      name: "交通事故检测数据清洗",
      dataset_name: "交通事故检测数据集",
      dataset_id: "traffic-ds-1",
      operators: ["去模糊", "去重复", "格式归一化", "帧抽稀"],
      total_items: 8500,
      cleaned_items: 7980,
      removed_items: 520,
      quality_score: 93.8,
      status: "completed",
      created_at: "2026-04-03",
      finished_at: "2026-04-03T18:30:00Z",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "clean-002",
      name: "事件类型分类数据清洗",
      dataset_name: "交通事件分类数据集",
      dataset_id: "traffic-ds-2",
      operators: ["去模糊", "类别均衡", "格式归一化"],
      total_items: 12000,
      cleaned_items: 11450,
      removed_items: 550,
      quality_score: 95.4,
      status: "completed",
      created_at: "2026-04-04",
      finished_at: "2026-04-04T20:00:00Z",
      scene_name: "交通事件识别",
      task_name: "事件类型分类"
    },
    {
      id: "clean-003",
      name: "车辆轨迹数据清洗",
      dataset_name: "车辆轨迹跟踪数据集",
      dataset_id: "traffic-ds-3",
      operators: ["GPS去噪", "轨迹平滑", "异常点过滤", "去重复"],
      total_items: 4200,
      cleaned_items: 3890,
      removed_items: 310,
      quality_score: 92.6,
      status: "completed",
      created_at: "2026-04-07",
      finished_at: "2026-04-07T22:00:00Z",
      scene_name: "交通事件识别",
      task_name: "车辆轨迹跟踪"
    }
  ]));

  // ================================================================
  // 4. 数据集管理（划分后/发布后）
  // ================================================================
  localStorage.setItem("taskforge_datasets", JSON.stringify([
    {
      id: "traffic-ds-1",
      name: "交通事故检测数据集",
      type: "video",
      source_type: "cloud",
      source_name: "高速公路监控中心",
      item_count: 7980,
      quality_status: "passed",
      task_name: "交通事故检测",
      scene_name: "交通事件识别",
      has_smart_annotation: true,
      smart_annotation_count: 1,
      versions: [
        { version: "v2.1", date: "2026-04-10", item_count: 7980, uploader: "王强", note: "清洗后版本" },
        { version: "v2.0", date: "2026-04-05", item_count: 5000, uploader: "李明", note: "扩充夜间事故样本" },
        { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "张伟", note: "初始版本" },
      ],
      created_at: "2026-04-01",
      status: "已发布",
      train_count: 5586,
      val_count: 1197,
      test_count: 1197,
      split_ratio: "70:15:15"
    },
    {
      id: "traffic-ds-2",
      name: "交通事件分类数据集",
      type: "image",
      source_type: "cloud",
      source_name: "城市道路监控",
      item_count: 11450,
      quality_status: "passed",
      task_name: "事件类型分类",
      scene_name: "交通事件识别",
      has_smart_annotation: true,
      smart_annotation_count: 1,
      versions: [
        { version: "v1.3", date: "2026-04-12", item_count: 11450, uploader: "赵磊", note: "7类事件，含清洗后" },
        { version: "v1.2", date: "2026-04-08", item_count: 5000, uploader: "赵磊", note: "新增7类事件标注" },
        { version: "v1.1", date: "2026-04-03", item_count: 4000, uploader: "张伟", note: "扩充拥堵类样本" },
        { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "李娜", note: "初始版本" },
      ],
      created_at: "2026-04-01",
      status: "已发布",
      train_count: 8015,
      val_count: 1718,
      test_count: 1717,
      split_ratio: "70:15:15"
    }
  ]));

  // ================================================================
  // 5. 专家标注任务
  // ================================================================
  localStorage.setItem("taskforge_annotation_jobs", JSON.stringify([
    {
      id: "aj-traffic-1",
      name: "交通事故检测-专家标注",
      dataset_id: "traffic-ds-1",
      dataset_name: "交通事故检测数据集",
      annotators: ["交警李浩", "专家王磊", "标注员陈静"],
      total_items: 7980,
      completed_items: 6480,
      kappa_score: 0.87,
      status: "in_progress",
      task_type: "目标检测",
      label_template: "bbox_rect",
      created_at: "2026-04-05T08:00:00Z",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "aj-traffic-2",
      name: "事件类型分类-专家标注",
      dataset_id: "traffic-ds-2",
      dataset_name: "交通事件分类数据集",
      annotators: ["标注员张霞", "标注员刘洋"],
      total_items: 11450,
      completed_items: 11450,
      kappa_score: 0.91,
      status: "completed",
      task_type: "图像分类",
      label_template: "multilabel_classify",
      created_at: "2026-04-06T09:00:00Z",
      scene_name: "交通事件识别",
      task_name: "事件类型分类"
    }
  ]));

  // ================================================================
  // 6. 智能标注任务
  // ================================================================
  localStorage.setItem("taskforge_smart_annotation_jobs", JSON.stringify([
    {
      id: "sa-traffic-1",
      name: "交通事故检测-AI预标注",
      dataset_id: "traffic-ds-1",
      dataset_name: "交通事故检测数据集",
      model_name: "YOLOv8-交通事件检测-v1.0",
      strategy: "full_prelabel",
      total_items: 7980,
      prelabeled_items: 7980,
      pending_review: 1596,
      auto_approved: 6384,
      status: "completed",
      created_at: "2026-04-10T08:30:00Z",
      confidence_threshold: 0.85,
      auto_pass_threshold: 0.92,
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "sa-traffic-2",
      name: "事件类型分类-主动学习",
      dataset_id: "traffic-ds-2",
      dataset_name: "交通事件分类数据集",
      model_name: "ResNet-事件分类-v2.1",
      strategy: "active_learning",
      total_items: 11450,
      prelabeled_items: 6867,
      pending_review: 1373,
      auto_approved: 5494,
      status: "running",
      created_at: "2026-04-13T09:00:00Z",
      confidence_threshold: 0.80,
      sampling_rate: 0.2,
      auto_pass_threshold: 0.90,
      scene_name: "交通事件识别",
      task_name: "事件类型分类"
    }
  ]));

  // ================================================================
  // 7. 版本历史
  // ================================================================
  localStorage.setItem("taskforge_version_history", JSON.stringify([
    {
      id: "vh-001",
      dataset_name: "交通事故检测数据集",
      version: "v2.1",
      change_type: "数据更新",
      change_count: 4980,
      uploader: "王强",
      date: "2026-04-10",
      note: "清洗后版本，移除模糊帧和重复帧",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "vh-002",
      dataset_name: "交通事故检测数据集",
      version: "v2.0",
      change_type: "数据扩充",
      change_count: 2000,
      uploader: "李明",
      date: "2026-04-05",
      note: "扩充夜间事故样本",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "vh-003",
      dataset_name: "交通事件分类数据集",
      version: "v1.3",
      change_type: "标注完成",
      change_count: 6450,
      uploader: "赵磊",
      date: "2026-04-12",
      note: "7类事件标注完成，Kappa=0.91",
      scene_name: "交通事件识别",
      task_name: "事件类型分类"
    }
  ]));

  // ================================================================
  // 8. 模型仓库（基座模型）
  // ================================================================
  localStorage.setItem("taskforge_models", JSON.stringify([
    {
      id: "model-base-yolo",
      name: "YOLOv8n",
      org: "Ultralytics",
      description: "Ultralytics YOLOv8n，超轻量目标检测模型，适合实时场景",
      task_type: "目标检测",
      category: "视觉模型",
      domain_tags: ["目标检测", "实时推理", "轻量级"],
      downloads: 382000,
      likes: 12400,
      size: "6.3 MB",
      precision: ["FP16"],
      framework: ["PyTorch", "ONNX"],
      last_updated: "2026-01-15",
      is_favorited: true
    },
    {
      id: "model-base-resnet",
      name: "ResNet50",
      org: "Microsoft",
      description: "ResNet50图像分类预训练模型，ImageNet预训练权重",
      task_type: "图像分类",
      category: "视觉模型",
      domain_tags: ["图像分类", "预训练"],
      downloads: 256000,
      likes: 8900,
      size: "98 MB",
      precision: ["FP32", "FP16"],
      framework: ["PyTorch", "ONNX"],
      last_updated: "2025-11-20"
    },
    {
      id: "model-base-deepsort",
      name: "DeepSORT",
      org: "OpenSource",
      description: "多目标跟踪模型，基于SORT改进，加入外观特征匹配",
      task_type: "多目标跟踪",
      category: "视觉模型",
      domain_tags: ["多目标跟踪", "ReID"],
      downloads: 45000,
      likes: 3200,
      size: "165 MB",
      precision: ["FP32"],
      framework: ["PyTorch"],
      last_updated: "2025-08-10"
    },
    // 微调后模型
    {
      id: "model-traffic-yolo-v1",
      name: "交通事件检测模型-v1.0",
      org: "SHEBC",
      description: "基于YOLOv8n微调的交通事件检测模型，支持事故/拥堵/行人检测",
      task_type: "目标检测",
      category: "领域模型",
      domain_tags: ["交通", "目标检测", "微调"],
      downloads: 1240,
      likes: 86,
      size: "6.8 MB",
      precision: ["FP16"],
      framework: ["PyTorch", "ONNX"],
      last_updated: now,
      is_favorited: true,
      source: "trained",
      source_task: "交通事故检测",
      accuracy: 91.2,
      recall: 88.7,
      map50: 89.4
    }
  ]));

  // ================================================================
  // 9. 模型训练任务（已完成）
  // ================================================================
  localStorage.setItem("taskforge_training_jobs", JSON.stringify([
    {
      id: "train-001",
      name: "交通事故检测模型训练",
      base_model: "YOLOv8n",
      dataset: "交通事故检测数据集",
      dataset_id: "traffic-ds-1",
      batch_size: 32,
      learning_rate: 0.001,
      epochs: 100,
      current_epoch: 100,
      gpu_info: "GPU 0: NVIDIA A100 80GB (65°C, 340W)",
      status: "completed",
      started_at: "2026-04-15T08:00:00Z",
      finished_at: "2026-04-16T14:30:00Z",
      best_epoch: 87,
      best_map50: 89.4,
      best_precision: 91.2,
      best_recall: 88.7,
      total_time: "30小时30分钟",
      output_model_id: "model-traffic-yolo-v1",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    },
    {
      id: "train-002",
      name: "事件类型分类模型训练",
      base_model: "ResNet50",
      dataset: "交通事件分类数据集",
      dataset_id: "traffic-ds-2",
      batch_size: 64,
      learning_rate: 0.0005,
      epochs: 50,
      current_epoch: 38,
      gpu_info: "GPU 0: NVIDIA A100 80GB (62°C, 320W)",
      status: "running",
      started_at: "2026-04-18T08:00:00Z",
      best_epoch: 35,
      best_accuracy: 93.1,
      best_val_loss: 0.18,
      scene_name: "交通事件识别",
      task_name: "事件类型分类"
    }
  ]));

  // ================================================================
  // 10. 模型评测任务
  // ================================================================
  localStorage.setItem("taskforge_eval_jobs", JSON.stringify([
    {
      id: "eval-001",
      name: "交通事件检测模型-v1.0 综合评测",
      model_name: "交通事件检测模型-v1.0",
      model_id: "model-traffic-yolo-v1",
      eval_type: "综合评测",
      test_dataset: "交通事故检测数据集-v2.1",
      test_size: 1197,
      status: "completed",
      overall_score: 87.6,
      accuracy: 91.2,
      precision: 88.9,
      recall: 88.7,
      f1_score: 88.8,
      map50: 89.4,
      map50_95: 62.3,
      speed_fps: 142,
      eval_date: "2026-04-16",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    }
  ]));

  // ================================================================
  // 11. 模型测试任务
  // ================================================================
  localStorage.setItem("taskforge_test_jobs", JSON.stringify([
    {
      id: "test-001",
      name: "交通事件检测-API压力测试",
      model_name: "交通事件检测模型-v1.0",
      model_id: "model-traffic-yolo-v1",
      test_type: "API压力测试",
      concurrent_users: 100,
      total_requests: 10000,
      success_rate: 99.2,
      avg_latency_ms: 48,
      p99_latency_ms: 120,
      status: "completed",
      test_date: "2026-04-17",
      scene_name: "交通事件识别",
      task_name: "交通事故检测"
    }
  ]));

  // ================================================================
  // 12. 知识库
  // ================================================================
  localStorage.setItem("taskforge_knowledge_bases", JSON.stringify([
    {
      id: "kb-traffic-law",
      name: "交通法规知识库",
      description: "中华人民共和国道路交通安全法及实施条例全文检索",
      status: "active",
      doc_count: 156,
      chunkCount: 892,
      vectorModel: "text2vec-base-chinese",
      topK: 5,
      similarityThreshold: 0.7,
      last_updated: "2026-04-10",
      fileSize: "12.4 MB"
    },
    {
      id: "kb-traffic-handbook",
      name: "交通事故处理手册",
      description: "各类交通事故现场处置流程、责任认定标准和赔偿参考",
      status: "active",
      doc_count: 89,
      chunkCount: 456,
      vectorModel: "text2vec-base-chinese",
      topK: 5,
      similarityThreshold: 0.75,
      last_updated: "2026-04-12",
      fileSize: "8.2 MB"
    }
  ]));

  // ================================================================
  // 13. Prompt模板
  // ================================================================
  localStorage.setItem("taskforge_prompts", JSON.stringify([
    {
      id: "prompt-traffic-1",
      name: "交通事故分析Prompt",
      category: "分析",
      system_prompt: "你是一位交通事故分析专家，根据提供的事故描述、图片和视频片段，分析事故原因、责任人及建议处理方案。",
      user_template: "## 任务\n分析以下交通事故：\n\n## 事故描述\n{{事故描述}}\n\n## 请输出\n1. 事故类型\n2. 主要原因\n3. 责任判定\n4. 处理建议",
      variables: ["事故描述"],
      usage_count: 234,
      status: "active",
      created_at: "2026-04-10"
    }
  ]));

  // ================================================================
  // 14. 智能体
  // ================================================================
  localStorage.setItem("taskforge_agents", JSON.stringify([
    {
      id: "agent-traffic-1",
      name: "交通事故AI分析助手",
      description: "基于交通事件检测模型和法规知识库的智能分析助手",
      status: "running",
      invoke_count: 1847,
      avg_latency_ms: 340,
      knowledge_bases: ["交通法规知识库", "交通事故处理手册"],
      prompt_template: "交通事故分析Prompt",
      model: "交通事件检测模型-v1.0",
      created_at: "2026-04-18",
      scene_name: "交通事件识别"
    }
  ]));

  console.log("✅ 交通事件识别全流程仿真数据注入完成！");
  console.log("📋 共注入 14 个 localStorage key");
  console.log("🚀 请访问 http://localhost:3000 查看仿真效果");
  console.log("");
  console.log("推荐浏览路径：");
  console.log("1. http://localhost:3000/task-modeling          → 任务建模（4个任务）");
  console.log("2. http://localhost:3000/data-asset/data-access → 数据接入（4个接入任务）");
  console.log("3. http://localhost:3000/data-cleaning          → 数据清洗（3个清洗任务）");
  console.log("4. http://localhost:3000/annotation              → 专家标注（2个标注任务）");
  console.log("5. http://localhost:3000/smart-annotation         → 智能标注（2个智能标注）");
  console.log("6. http://localhost:3000/data-asset/dataset      → 数据集管理（2个已发布数据集）");
  console.log("7. http://localhost:3000/model-repo              → 模型仓库（基座+微调模型）");
  console.log("8. http://localhost:3000/model-training          → 模型训练（已完成+进行中）");
  console.log("9. http://localhost:3000/model-eval              → 模型评测（综合评测报告）");
  console.log("10. http://localhost:3000/model-testing          → 模型测试（API压力测试）");
  console.log("11. http://localhost:3000/knowledge-base        → 知识库（交通法规+处理手册）");
  console.log("12. http://localhost:3000/agent-management       → 智能体（交通事故分析助手）");
})();
