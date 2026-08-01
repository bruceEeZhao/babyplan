/**
 * BabyPlan — 内容库 Seed
 *
 * 填充内容：
 * 1. 20 个月龄阶段（元数据，全量）
 * 2. 0~36 个月活动库（54 个核心活动，跨阶段复用，覆盖全部 20 个阶段）
 * 3. 0~36 个月里程碑（111 个，含官方对齐条目，显式关联活动 + 累计次数阈值）
 *
 * 内容依据：CDC "Learn the Signs. Act Early"、AAP 婴幼儿发育里程碑、
 * 中国卫健委《0-6 岁儿童发育行为评估量表》等公开育儿知识整理。
 * 幂等：运行前清空内容库与用户数据。
 */
import { PrismaClient, SkillArea, Scenario, Prop } from "@prisma/client";
import { initBabyMilestones } from "../src/lib/checklist";

const prisma = new PrismaClient();

// ============================================================
// 1. 月龄阶段（20 个）
// ============================================================
const stages = [
  { code: "stage-01", label: "0-1 个月", minMonth: 0, maxMonth: 1 },
  { code: "stage-02", label: "1-2 个月", minMonth: 1, maxMonth: 2 },
  { code: "stage-03", label: "2-3 个月", minMonth: 2, maxMonth: 3 },
  { code: "stage-04", label: "3-4 个月", minMonth: 3, maxMonth: 4 },
  { code: "stage-05", label: "4-5 个月", minMonth: 4, maxMonth: 5 },
  { code: "stage-06", label: "5-6 个月", minMonth: 5, maxMonth: 6 },
  { code: "stage-07", label: "6-7 个月", minMonth: 6, maxMonth: 7 },
  { code: "stage-08", label: "7-8 个月", minMonth: 7, maxMonth: 8 },
  { code: "stage-09", label: "8-9 个月", minMonth: 8, maxMonth: 9 },
  { code: "stage-10", label: "9-10 个月", minMonth: 9, maxMonth: 10 },
  { code: "stage-11", label: "10-11 个月", minMonth: 10, maxMonth: 11 },
  { code: "stage-12", label: "11-12 个月", minMonth: 11, maxMonth: 12 },
  { code: "stage-13", label: "13-15 个月", minMonth: 13, maxMonth: 15 },
  { code: "stage-14", label: "16-18 个月", minMonth: 16, maxMonth: 18 },
  { code: "stage-15", label: "19-21 个月", minMonth: 19, maxMonth: 21 },
  { code: "stage-16", label: "22-24 个月", minMonth: 22, maxMonth: 24 },
  { code: "stage-17", label: "25-27 个月", minMonth: 25, maxMonth: 27 },
  { code: "stage-18", label: "28-30 个月", minMonth: 28, maxMonth: 30 },
  { code: "stage-19", label: "31-33 个月", minMonth: 31, maxMonth: 33 },
  { code: "stage-20", label: "34-36 个月", minMonth: 34, maxMonth: 36 },
].map((s, i) => ({ ...s, sortOrder: i + 1 }));

// ============================================================
// 2. 活动库（0~6 个月，24 个核心活动，跨阶段复用）
//    stages 字段为适用阶段 code 列表
// ============================================================
interface ActivityDef {
  key: string; // 内部 key，用于里程碑关联
  title: string;
  description: string;
  dailyTargetCount: number;
  safetyTip?: string;
  skillAreas: SkillArea[];
  scenarios: Scenario[];
  props: Prop[];
  stages: string[];
}

const activities: ActivityDef[] = [
  {
    key: "tummy-time",
    title: "俯卧抬头",
    description:
      "让宝宝清醒时俯卧在平坦软垫上，在前方放置黑白卡或色彩鲜艳的玩具，轻声呼唤鼓励宝宝抬头。从每次 1~2 分钟开始，随月龄逐渐延长时间。",
    dailyTargetCount: 3,
    safetyTip: "必须在宝宝清醒时进行，全程家长看护；垫软垫；喂奶后 1 小时再进行，避免吐奶。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "contrast-card-tracking",
    title: "黑白卡追视",
    description:
      "将黑白对比卡放在宝宝眼前 20~30cm 处，缓慢左右移动，观察宝宝视线是否追随卡片移动。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SENSORY],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.CARD],
    stages: ["stage-01", "stage-02"],
  },
  {
    key: "face-to-face",
    title: "人脸对视互动",
    description:
      "将脸靠近宝宝（20~30cm），微笑、做夸张表情、轻柔呼唤宝宝的名字，观察宝宝是否注视你的脸并给出回应。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03"],
  },
  {
    key: "sound-tracking",
    title: "声音追踪游戏",
    description:
      "在宝宝身体两侧轻轻摇动响铃或呼唤名字，观察宝宝是否会转头寻找声源，锻炼听觉定位能力。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SENSORY],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.RATTLE],
    stages: ["stage-01", "stage-02"],
  },
  {
    key: "baby-massage",
    title: "婴儿抚触按摩",
    description:
      "洗澡后或睡前，用温水洗净双手、涂少量润肤油，轻柔按摩宝宝的四肢、背部与腹部（避开脐部），配合轻柔的说话声。",
    dailyTargetCount: 1,
    safetyTip: "室内温度适宜，手法轻柔；观察宝宝反应，抗拒或哭闹时立即停止。",
    skillAreas: [SkillArea.SENSORY],
    scenarios: [Scenario.BEDTIME],
    props: [Prop.OIL],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "passive-exercise",
    title: "轻柔被动操",
    description:
      "宝宝仰卧时，家长握住宝宝手腕与脚踝，缓慢做伸屈、外展等被动运动，配合轻柔的口令和儿歌节奏。",
    dailyTargetCount: 2,
    safetyTip: "动作缓慢轻柔，宝宝抗拒时不勉强。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03"],
  },
  {
    key: "conversation-interaction",
    title: "对话互动",
    description:
      "随时随地与宝宝对话：描述正在做的事情，等待宝宝发出声音后模仿回应，形成你来我往的交流。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.LANGUAGE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "music-morning",
    title: "听儿歌磨耳朵",
    description:
      "播放节奏舒缓的儿歌或英文童谣，抱着宝宝轻轻摇晃，观察宝宝对音乐的反应，可在睡前作为固定仪式。",
    dailyTargetCount: 2,
    safetyTip: "音量适中，单次不超过 15~20 分钟。",
    skillAreas: [SkillArea.LANGUAGE, SkillArea.SENSORY],
    scenarios: [Scenario.BEDTIME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "grasp-practice",
    title: "抓握练习",
    description:
      "将摇铃或软玩具轻轻触碰宝宝手心，刺激抓握反射；也可让宝宝抓住家长的手指，练习握力。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-02", "stage-03", "stage-04", "stage-05"],
  },
  {
    key: "rattle-shake",
    title: "摇铃摇动",
    description:
      "示范摇动响铃发出声音，鼓励宝宝自己抓握摇铃并摇晃，感受「摇一摇就有声音」的因果联系。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.RATTLE],
    stages: ["stage-03", "stage-04", "stage-05", "stage-06"],
  },
  {
    key: "pull-to-sit",
    title: "拉坐练习",
    description:
      "宝宝仰卧，家长握住宝宝双手，缓慢拉起至坐姿再缓慢放下，锻炼颈部与躯干力量。约 3 个月后开始。",
    dailyTargetCount: 2,
    safetyTip: "须待宝宝能自主控制头部后再进行；动作缓慢，若头部后仰立即停止。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "rolling-assist",
    title: "翻身辅助",
    description:
      "宝宝仰卧时，家长轻推宝宝一侧肩膀与臀部，辅助完成仰卧到侧卧再到俯卧的翻身动作，左右交替进行。",
    dailyTargetCount: 3,
    safetyTip: "动作轻柔，在软垫上进行。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-03", "stage-04", "stage-05"],
  },
  {
    key: "peekaboo",
    title: "躲猫猫游戏",
    description:
      "用手或手帕遮住自己的脸，再突然打开并发出「喵~」的声音，观察宝宝的反应，等待宝宝主动发起互动。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "reach-and-grab",
    title: "伸手抓玩具",
    description:
      "在宝宝伸手可及的范围内悬挂或放置色彩鲜艳的玩具，鼓励宝宝主动伸手抓取，锻炼手眼协调。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.FINE_MOTOR, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "mirror-play",
    title: "照镜子游戏",
    description:
      "抱着宝宝照镜子，指着镜中的宝宝和自己说出名字，做表情互动，观察宝宝对镜像的好奇与反应。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.MIRROR],
    stages: ["stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "babble-response",
    title: "咿呀学语回应",
    description:
      "宝宝发出咿咿呀呀的声音时，立即模仿回应并加入新的音节，拉长声调，鼓励宝宝继续发声交流。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.LANGUAGE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-03", "stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "supported-sitting",
    title: "靠坐练习",
    description:
      "用靠垫支撑或让宝宝坐在家长怀中，练习头部控制与躯干稳定，从短时间开始逐渐延长。",
    dailyTargetCount: 2,
    safetyTip: "靠垫支撑到位，时间由短到长，宝宝疲劳即休息。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-05", "stage-06", "stage-07"],
  },
  {
    key: "object-transfer",
    title: "物品传递",
    description:
      "给宝宝一个软积木或玩具，示范从一只手换到另一只手，鼓励宝宝模仿传递动作，锻炼双手协作。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.BLOCK],
    stages: ["stage-06", "stage-07"],
  },
  {
    key: "book-reading",
    title: "布书绘本翻看",
    description:
      "抱着宝宝翻看布书或硬页绘本，指着图案说出名称，用夸张的语气和表情讲故事，培养阅读兴趣。",
    dailyTargetCount: 1,
    skillAreas: [SkillArea.COGNITIVE, SkillArea.LANGUAGE],
    scenarios: [Scenario.BEDTIME],
    props: [Prop.PICTURE_BOOK],
    stages: ["stage-05", "stage-06", "stage-07"],
  },
  {
    key: "bicycle-kicks",
    title: "蹬自行车运动",
    description:
      "宝宝仰卧，家长握住宝宝脚踝做轻柔的蹬自行车动作，配合儿歌节奏，锻炼下肢力量与灵活性。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04"],
  },
  {
    key: "smell-exploration",
    title: "嗅觉探索",
    description:
      "将苹果、香蕉等安全水果凑近宝宝鼻前（不接触），让宝宝闻气味，同时说出水果名称，丰富感官体验。",
    dailyTargetCount: 1,
    safetyTip: "水果仅用于闻嗅，不让宝宝啃咬。",
    skillAreas: [SkillArea.SENSORY],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.FRUIT],
    stages: ["stage-05", "stage-06", "stage-07"],
  },
  {
    key: "expression-mimicry",
    title: "模仿表情游戏",
    description:
      "面对宝宝缓慢做吐舌头、张大嘴、皱眉等表情，停留几秒，观察宝宝是否会模仿你的表情。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-04", "stage-05", "stage-06", "stage-07"],
  },
  {
    key: "sole-touch",
    title: "脚底触觉游戏",
    description:
      "用不同材质（毛巾、软刷、手掌）轻轻触碰宝宝的脚底和小腿，观察宝宝的反应，丰富触觉体验。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SENSORY],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOWEL],
    stages: ["stage-01", "stage-02", "stage-03", "stage-04"],
  },
  {
    key: "moving-object-tracking",
    title: "追视移动物体",
    description:
      "用色彩鲜艳的玩具在宝宝眼前缓慢画弧线移动，观察宝宝视线是否跟随，锻炼眼球运动与注意力。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE, SkillArea.SENSORY],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-02", "stage-03", "stage-04"],
  },
  // ---- 7~36 个月活动（stage-08 起） ----
  {
    key: "sitting-independently",
    title: "独坐练习",
    description:
      "让宝宝不靠支撑独自坐稳，前方放置玩具吸引伸手，练习躯干平衡；周围铺软垫防倾倒。",
    dailyTargetCount: 2,
    safetyTip: "周围铺软垫，宝宝疲劳即休息。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-07", "stage-08", "stage-09"],
  },
  {
    key: "crawling-game",
    title: "爬行游戏",
    description:
      "在宝宝前方滚动球或放置玩具，鼓励宝宝匍匐爬行、手膝爬行去够取，练习四肢协调。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-07", "stage-08", "stage-09", "stage-10"],
  },
  {
    key: "object-permanence",
    title: "物体恒存游戏",
    description:
      "当着宝宝的面用布或杯子盖住玩具，问「玩具去哪儿了？」鼓励宝宝掀开寻找，理解看不见的东西依然存在。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-07", "stage-08", "stage-09", "stage-10", "stage-11", "stage-12"],
  },
  {
    key: "pincer-grasp",
    title: "捏取练习",
    description:
      "提供小块安全食物或小玩具，示范用拇指和食指捏起，锻炼精细抓握与手眼协调。",
    dailyTargetCount: 2,
    safetyTip: "小物件需防呛噎，全程看护。",
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-08", "stage-09", "stage-10", "stage-11", "stage-12"],
  },
  {
    key: "standing-support",
    title: "扶站练习",
    description:
      "扶着宝宝腋下或让宝宝扶着沙发站立，练习腿部力量与平衡，时间由短到长。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-08", "stage-09", "stage-10", "stage-11", "stage-12"],
  },
  {
    key: "cruising",
    title: "巡航练习",
    description:
      "让宝宝扶着家具边缘横向移动，家长在旁保护，逐渐增加移动距离。",
    dailyTargetCount: 2,
    safetyTip: "家具稳固，移开危险物品。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-10", "stage-11", "stage-12", "stage-13"],
  },
  {
    key: "clapping-game",
    title: "拍手游戏",
    description:
      "边唱拍手歌边示范拍手，引导宝宝模仿拍手动作，锻炼节奏感与模仿能力。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL, SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-08", "stage-09", "stage-10", "stage-11", "stage-12", "stage-13", "stage-14", "stage-15"],
  },
  {
    key: "bye-bye-wave",
    title: "再见挥手",
    description:
      "出门或家人离开时，边挥手边说「拜拜」，引导宝宝模仿挥手告别，理解告别礼仪。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-08", "stage-09", "stage-10", "stage-11", "stage-12", "stage-13", "stage-14", "stage-15"],
  },
  {
    key: "body-parts",
    title: "指认身体部位",
    description:
      "问「宝宝的鼻子在哪里？」引导宝宝指认五官，再扩展到手脚四肢，锻炼认知与语言理解。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.COGNITIVE, SkillArea.LANGUAGE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-10", "stage-11", "stage-12", "stage-13", "stage-14", "stage-15", "stage-16"],
  },
  {
    key: "block-stacking",
    title: "叠积木",
    description:
      "示范将积木一块块叠高，鼓励宝宝模仿，从叠两块逐渐到多块，锻炼精细动作与专注力。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.BLOCK],
    stages: ["stage-12", "stage-13", "stage-14", "stage-15", "stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "page-turning",
    title: "翻书页",
    description:
      "鼓励宝宝自己翻动硬页书的书页，边翻边说出内容，锻炼手指灵活与阅读兴趣。",
    dailyTargetCount: 1,
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.PICTURE_BOOK],
    stages: ["stage-12", "stage-13", "stage-14", "stage-15", "stage-16", "stage-17", "stage-18"],
  },
  {
    key: "cup-drinking",
    title: "用杯子喝水",
    description:
      "用带手柄的学饮杯装少量水，鼓励宝宝双手捧杯自己喝，锻炼手口协调与自理能力。",
    dailyTargetCount: 2,
    safetyTip: "少量水防呛，水温适宜。",
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-13", "stage-14", "stage-15", "stage-16", "stage-17", "stage-18"],
  },
  {
    key: "walking-practice",
    title: "独走练习",
    description:
      "在宝宝前方张开双臂引导独走，从迈出两步到几步，逐步增加距离，练习平衡与信心。",
    dailyTargetCount: 3,
    safetyTip: "平整地面，周围无尖角。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-13", "stage-14", "stage-15"],
  },
  {
    key: "pointing-request",
    title: "指物表达",
    description:
      "当宝宝想要某物时，鼓励宝宝用手指指向并说出名称，而不是立即代劳，培养语言表达。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.LANGUAGE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-13", "stage-14", "stage-15", "stage-16"],
  },
  {
    key: "housework-mimic",
    title: "模仿家务",
    description:
      "给宝宝小抹布、小扫把，让宝宝模仿大人擦桌子、扫地，培养参与感与自理意识。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-13", "stage-14", "stage-15", "stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "run-jump-play",
    title: "跑跳游戏",
    description:
      "在户外或开阔空间和宝宝玩追逐跑、踢球、双脚跳游戏，锻炼大肌肉群与协调能力。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.OUTDOOR],
    props: [Prop.BALL],
    stages: ["stage-14", "stage-15", "stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "short-phrases",
    title: "说短句",
    description:
      "日常中扩展宝宝的表达：宝宝说「水」，家长回应「宝宝要喝水」，引导说出更完整的句子。",
    dailyTargetCount: 3,
    skillAreas: [SkillArea.LANGUAGE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-14", "stage-15", "stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "color-shapes",
    title: "颜色形状认知",
    description:
      "用积木或卡片教认颜色和形状，玩「把红色的积木给妈妈」游戏，锻炼分类与指令理解。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.BLOCK],
    stages: ["stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "dress-practice",
    title: "穿脱衣物",
    description:
      "鼓励宝宝自己脱袜子、脱鞋、解开魔术贴，逐步练习穿脱简单衣物，培养自理能力。",
    dailyTargetCount: 2,
    safetyTip: "给予充足时间，不催促。",
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "social-play",
    title: "社交游戏",
    description:
      "安排与其他小朋友玩平行游戏或简单轮流游戏，学习分享、等待与社交互动。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL],
    scenarios: [Scenario.OUTDOOR],
    props: [Prop.TOY],
    stages: ["stage-18", "stage-19", "stage-20"],
  },
  {
    key: "scribble-drawing",
    title: "涂鸦画画",
    description:
      "提供粗蜡笔和大纸，让宝宝自由涂鸦，不纠正「画得像不像」，保护创造力与握笔兴趣。",
    dailyTargetCount: 2,
    safetyTip: "使用无毒可水洗蜡笔。",
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "puzzle-starter",
    title: "拼图入门",
    description:
      "提供 2-3 片的大块拼图，示范并引导宝宝将拼图块放入对应位置，锻炼形状匹配与耐心。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE, SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "counting-songs",
    title: "数字儿歌",
    description:
      "唱数字儿歌（如「一二三四五，上山打老虎」），配合手指动作，建立数感与节奏感。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.LANGUAGE, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "hide-and-seek",
    title: "捉迷藏",
    description:
      "亲子捉迷藏：家长躲起来呼唤宝宝名字，宝宝找到后给予欢呼鼓励，锻炼空间感与安全感。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE, SkillArea.SOCIAL_EMOTIONAL],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-13", "stage-14", "stage-15", "stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "knock-toys",
    title: "双手对敲",
    description:
      "给宝宝两只手各拿一个小玩具，示范互相敲击发出声音，锻炼双手协调与因果认知。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-08", "stage-09", "stage-10"],
  },
  {
    key: "twist-caps",
    title: "旋拧练习",
    description:
      "提供带旋盖的瓶子或旋钮玩具，示范拧开和拧紧瓶盖，锻炼手腕旋转与手指力量。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-14", "stage-15", "stage-16", "stage-17", "stage-18"],
  },
  {
    key: "object-uses",
    title: "物品用途认知",
    description:
      "指认家中常用物品并演示用途：「杯子用来喝水、灯会亮、电话用来讲话」，建立物品功能概念。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-14", "stage-15", "stage-16"],
  },
  {
    key: "pretend-play",
    title: "装扮游戏",
    description:
      "和宝宝玩假装游戏：给娃娃喂饭、哄娃娃睡觉、假装打电话，发展想象力与角色认知。",
    dailyTargetCount: 2,
    skillAreas: [SkillArea.SOCIAL_EMOTIONAL, SkillArea.COGNITIVE],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-16", "stage-17", "stage-18", "stage-19", "stage-20"],
  },
  {
    key: "forward-jump",
    title: "向前跳游戏",
    description:
      "在地面贴出线条或格子，示范双脚向前跳出一段距离，鼓励宝宝模仿，锻炼下肢爆发力。",
    dailyTargetCount: 3,
    safetyTip: "地面平整防滑。",
    skillAreas: [SkillArea.GROSS_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.NONE],
    stages: ["stage-18", "stage-19", "stage-20"],
  },
  {
    key: "bead-threading",
    title: "串珠穿绳",
    description:
      "提供粗绳和大孔珠子，示范将珠子穿到绳上，锻炼手眼协调与专注力。",
    dailyTargetCount: 1,
    safetyTip: "珠子需足够大，防吞食。",
    skillAreas: [SkillArea.FINE_MOTOR],
    scenarios: [Scenario.AT_HOME],
    props: [Prop.TOY],
    stages: ["stage-18", "stage-19", "stage-20"],
  },
];

// ============================================================
// 3. 里程碑（0~6 个月，显式关联活动）
//    thresholdCount：累计完成次数阈值（≈ 每日目标次数 × 建议坚持天数）
// ============================================================
interface MilestoneDef {
  key: string;
  title: string;
  stageCode: string;
  skillArea: SkillArea;
  thresholdCount: number;
  activityKeys: string[];
}

const milestones: MilestoneDef[] = [
  // ---- stage-01 (0-1 月) ----
  {
    key: "m01-head-lift",
    title: "俯卧时能短暂抬头",
    stageCode: "stage-01",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["tummy-time"],
  },
  {
    key: "m01-hearing-response",
    title: "对声音有反应（巨响会惊动）",
    stageCode: "stage-01",
    skillArea: SkillArea.SENSORY,
    thresholdCount: 10,
    activityKeys: ["sound-tracking", "music-morning"],
  },
  {
    key: "m01-face-tracking",
    title: "目光能追随人脸或黑白卡到中线",
    stageCode: "stage-01",
    skillArea: SkillArea.SENSORY,
    thresholdCount: 10,
    activityKeys: ["contrast-card-tracking", "face-to-face"],
  },
  {
    key: "m01-massage-calm",
    title: "适应抚触并能放松",
    stageCode: "stage-01",
    skillArea: SkillArea.SENSORY,
    thresholdCount: 10,
    activityKeys: ["baby-massage"],
  },
  // ---- stage-02 (1-2 月) ----
  {
    key: "m02-head-lift-45",
    title: "俯卧能抬头 45°",
    stageCode: "stage-02",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["tummy-time"],
  },
  {
    key: "m02-cooing",
    title: "会发出咕咕声",
    stageCode: "stage-02",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 15,
    activityKeys: ["conversation-interaction", "music-morning"],
  },
  {
    key: "m02-social-smile",
    title: "能回应微笑",
    stageCode: "stage-02",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 10,
    activityKeys: ["face-to-face"],
  },
  {
    key: "m02-tracking-180",
    title: "目光能追视 180°",
    stageCode: "stage-02",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 10,
    activityKeys: ["moving-object-tracking", "contrast-card-tracking"],
  },
  // ---- stage-03 (2-3 月) ----
  {
    key: "m03-head-lift-90",
    title: "俯卧能抬头 90°",
    stageCode: "stage-03",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 25,
    activityKeys: ["tummy-time"],
  },
  {
    key: "m03-babbling",
    title: "会发出咿咿呀呀声",
    stageCode: "stage-03",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["conversation-interaction", "babble-response"],
  },
  {
    key: "m03-laugh-out-loud",
    title: "能笑出声",
    stageCode: "stage-03",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["face-to-face", "mirror-play"],
  },
  {
    key: "m03-hand-open-grasp",
    title: "手能张开主动抓握",
    stageCode: "stage-03",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["grasp-practice"],
  },
  {
    key: "m03-pull-to-sit-head",
    title: "拉坐时头不后仰",
    stageCode: "stage-03",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["pull-to-sit"],
  },
  // ---- stage-04 (3-4 月) ----
  {
    key: "m04-forearm-support",
    title: "俯卧能撑起前臂",
    stageCode: "stage-04",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 30,
    activityKeys: ["tummy-time"],
  },
  {
    key: "m04-rattle-shake",
    title: "会抓握摇铃并摇晃",
    stageCode: "stage-04",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 20,
    activityKeys: ["rattle-shake", "grasp-practice"],
  },
  {
    key: "m04-long-babble",
    title: "会发出长串咿呀声",
    stageCode: "stage-04",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["conversation-interaction", "babble-response"],
  },
  {
    key: "m04-roll-to-side",
    title: "能从仰卧翻到侧卧",
    stageCode: "stage-04",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["rolling-assist"],
  },
  {
    key: "m04-reach-for-object",
    title: "会伸手够玩具",
    stageCode: "stage-04",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 20,
    activityKeys: ["reach-and-grab"],
  },
  // ---- stage-05 (4-5 月) ----
  {
    key: "m05-independent-roll",
    title: "能独立翻身（仰卧翻到俯卧）",
    stageCode: "stage-05",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 30,
    activityKeys: ["rolling-assist", "tummy-time"],
  },
  {
    key: "m05-accurate-grasp",
    title: "能准确伸手抓玩具",
    stageCode: "stage-05",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 25,
    activityKeys: ["reach-and-grab"],
  },
  {
    key: "m05-mimic",
    title: "会模仿声音或表情",
    stageCode: "stage-05",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 20,
    activityKeys: ["expression-mimicry", "babble-response"],
  },
  {
    key: "m05-pull-to-sit-stable",
    title: "拉坐时头颈稳定",
    stageCode: "stage-05",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["pull-to-sit"],
  },
  // ---- stage-06 (5-6 月) ----
  {
    key: "m06-supported-sitting",
    title: "能靠坐且头部稳定",
    stageCode: "stage-06",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["supported-sitting"],
  },
  {
    key: "m06-peekaboo-active",
    title: "会主动玩躲猫猫",
    stageCode: "stage-06",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["peekaboo"],
  },
  {
    key: "m06-ba-ma-sounds",
    title: "能发出「ba」「ma」等音",
    stageCode: "stage-06",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["babble-response", "conversation-interaction"],
  },
  {
    key: "m06-object-transfer",
    title: "双手传递物品",
    stageCode: "stage-06",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["object-transfer"],
  },
  // ---- stage-07 (6-7 月) ----
  {
    key: "m07-sit-momentarily",
    title: "能独坐片刻",
    stageCode: "stage-07",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 25,
    activityKeys: ["supported-sitting"],
  },
  {
    key: "m07-name-response",
    title: "对自己的名字有反应",
    stageCode: "stage-07",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["conversation-interaction", "babble-response"],
  },
  {
    key: "m07-book-interest",
    title: "会注视并翻看绘本",
    stageCode: "stage-07",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["book-reading"],
  },
  {
    key: "m07-reach-distant",
    title: "会伸手够远处的玩具",
    stageCode: "stage-07",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["reach-and-grab"],
  },
  // ---- stage-08~20 里程碑（7~36 个月） ----
  {
    key: "m08-sit-independently",
    title: "能独立坐稳",
    stageCode: "stage-08",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 25,
    activityKeys: ["sitting-independently", "supported-sitting"],
  },
  {
    key: "m08-crawl",
    title: "会匍匐或手膝爬行",
    stageCode: "stage-08",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["crawling-game"],
  },
  {
    key: "m08-pincer-grasp",
    title: "会用拇指食指捏取小物",
    stageCode: "stage-08",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["pincer-grasp"],
  },
  {
    key: "m08-object-permanence",
    title: "会寻找被藏起来的玩具",
    stageCode: "stage-08",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["object-permanence"],
  },
  {
    key: "m09-stand-with-support",
    title: "能扶着站立",
    stageCode: "stage-09",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["standing-support"],
  },
  {
    key: "m09-clap",
    title: "会拍手",
    stageCode: "stage-09",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["clapping-game"],
  },
  {
    key: "m09-wave-bye",
    title: "会挥手再见",
    stageCode: "stage-09",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["bye-bye-wave"],
  },
  {
    key: "m10-cruise",
    title: "能扶着家具巡航移动",
    stageCode: "stage-10",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["cruising", "standing-support"],
  },
  {
    key: "m10-pincer-master",
    title: "拇食指捏取熟练",
    stageCode: "stage-10",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 20,
    activityKeys: ["pincer-grasp"],
  },
  {
    key: "m10-simple-instruction",
    title: "能听懂简单指令",
    stageCode: "stage-10",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["conversation-interaction", "body-parts"],
  },
  {
    key: "m10-hide-seek",
    title: "会主动玩物体恒存游戏",
    stageCode: "stage-10",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["object-permanence", "peekaboo"],
  },
  {
    key: "m11-stand-alone",
    title: "能独立站立片刻",
    stageCode: "stage-11",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["standing-support", "cruising"],
  },
  {
    key: "m11-body-parts",
    title: "能指认身体部位",
    stageCode: "stage-11",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["body-parts"],
  },
  {
    key: "m11-first-words",
    title: "能说 1-2 个有意义的词",
    stageCode: "stage-11",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["conversation-interaction", "babble-response"],
  },
  {
    key: "m11-wave-master",
    title: "会主动挥手再见",
    stageCode: "stage-11",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["bye-bye-wave"],
  },
  {
    key: "m12-walk-steps",
    title: "能独走几步",
    stageCode: "stage-12",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 25,
    activityKeys: ["walking-practice", "cruising"],
  },
  {
    key: "m12-stack-two",
    title: "会叠两块积木",
    stageCode: "stage-12",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["block-stacking"],
  },
  {
    key: "m12-turn-pages",
    title: "会翻书页",
    stageCode: "stage-12",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 10,
    activityKeys: ["page-turning", "book-reading"],
  },
  {
    key: "m12-gesture-request",
    title: "会用动作表达需求",
    stageCode: "stage-12",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 20,
    activityKeys: ["pointing-request", "conversation-interaction"],
  },
  {
    key: "m13-walk-independently",
    title: "能独立行走",
    stageCode: "stage-13",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 25,
    activityKeys: ["walking-practice"],
  },
  {
    key: "m13-three-words",
    title: "会说 3-5 个词",
    stageCode: "stage-13",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["conversation-interaction", "short-phrases"],
  },
  {
    key: "m13-cup-drinking",
    title: "会用杯子喝水",
    stageCode: "stage-13",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["cup-drinking"],
  },
  {
    key: "m13-point-request",
    title: "会指物表达需求",
    stageCode: "stage-13",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["pointing-request"],
  },
  {
    key: "m14-jog",
    title: "能小跑",
    stageCode: "stage-14",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m14-ten-words",
    title: "会说 6-10 个词",
    stageCode: "stage-14",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["conversation-interaction", "short-phrases"],
  },
  {
    key: "m14-mimic-housework",
    title: "会模仿做家务",
    stageCode: "stage-14",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["housework-mimic"],
  },
  {
    key: "m14-scribble",
    title: "会涂鸦",
    stageCode: "stage-14",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["scribble-drawing"],
  },
  {
    key: "m15-kick-ball",
    title: "会踢球",
    stageCode: "stage-15",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m15-two-word-phrases",
    title: "会说两个词的短句",
    stageCode: "stage-15",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["short-phrases", "conversation-interaction"],
  },
  {
    key: "m15-stack-four",
    title: "能搭 3-4 块积木",
    stageCode: "stage-15",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["block-stacking"],
  },
  {
    key: "m15-body-parts-master",
    title: "能准确指认身体部位",
    stageCode: "stage-15",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["body-parts"],
  },
  {
    key: "m16-jump",
    title: "能双脚离地跳",
    stageCode: "stage-16",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m16-remove-shoes",
    title: "会脱鞋袜",
    stageCode: "stage-16",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["dress-practice"],
  },
  {
    key: "m16-simple-sentences",
    title: "会说简单的句子",
    stageCode: "stage-16",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 25,
    activityKeys: ["short-phrases", "conversation-interaction"],
  },
  {
    key: "m16-follow-instructions",
    title: "能完成两步指令",
    stageCode: "stage-16",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 20,
    activityKeys: ["conversation-interaction", "body-parts", "color-shapes"],
  },
  {
    key: "m17-stand-one-foot",
    title: "能单脚站片刻",
    stageCode: "stage-17",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m17-colors",
    title: "能认识常见颜色",
    stageCode: "stage-17",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["color-shapes"],
  },
  {
    key: "m17-simple-puzzle",
    title: "能完成 2-3 片拼图",
    stageCode: "stage-17",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["puzzle-starter"],
  },
  {
    key: "m17-say-i",
    title: "会用「我」表达自己",
    stageCode: "stage-17",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["short-phrases", "conversation-interaction"],
  },
  {
    key: "m18-climb-stairs",
    title: "能上下楼梯",
    stageCode: "stage-18",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m18-simple-dressing",
    title: "会穿简单衣物",
    stageCode: "stage-18",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["dress-practice"],
  },
  {
    key: "m18-sing-snippet",
    title: "能唱简单儿歌片段",
    stageCode: "stage-18",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["counting-songs", "music-morning"],
  },
  {
    key: "m18-parallel-play",
    title: "会玩平行游戏",
    stageCode: "stage-18",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["social-play"],
  },
  {
    key: "m19-alt-stairs",
    title: "能双脚交替上楼梯",
    stageCode: "stage-19",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m19-three-word-sentences",
    title: "会说 3-4 词的完整句子",
    stageCode: "stage-19",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["short-phrases"],
  },
  {
    key: "m19-draw-circle",
    title: "能画圆圈",
    stageCode: "stage-19",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["scribble-drawing"],
  },
  {
    key: "m19-wait-turn",
    title: "能等待轮流",
    stageCode: "stage-19",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["social-play"],
  },
  {
    key: "m20-hop",
    title: "能单脚跳",
    stageCode: "stage-20",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["run-jump-play"],
  },
  {
    key: "m20-tell-stories",
    title: "能讲简单的故事",
    stageCode: "stage-20",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 20,
    activityKeys: ["short-phrases", "book-reading"],
  },
  {
    key: "m20-shapes",
    title: "能认识 3-4 种形状",
    stageCode: "stage-20",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["color-shapes"],
  },
  {
    key: "m20-self-care",
    title: "会自己吃饭穿衣",
    stageCode: "stage-20",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["dress-practice", "cup-drinking"],
  },
  // ---- 官方对齐里程碑（依据《3岁以下婴幼儿心理行为发育标志自评表》等） ----
  {
    key: "gov03-head-stable",
    title: "被竖抱时头能稳稳地立着",
    stageCode: "stage-03",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["pull-to-sit", "tummy-time"],
  },
  {
    key: "gov03-eye-locate-sound",
    title: "能用眼睛寻找声源",
    stageCode: "stage-03",
    skillArea: SkillArea.SENSORY,
    thresholdCount: 10,
    activityKeys: ["sound-tracking", "contrast-card-tracking"],
  },
  {
    key: "gov06-sit-moment",
    title: "能自己坐一会儿（允许手撑地）",
    stageCode: "stage-06",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["supported-sitting", "sitting-independently"],
  },
  {
    key: "gov06-name-turn",
    title: "叫名字会朝声音方向转头",
    stageCode: "stage-06",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 10,
    activityKeys: ["conversation-interaction", "sound-tracking"],
  },
  {
    key: "gov06-drop-seek",
    title: "看到物品掉落会去找",
    stageCode: "stage-06",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 10,
    activityKeys: ["object-permanence", "peekaboo"],
  },
  {
    key: "gov06-stranger-aware",
    title: "能区分熟人和生人",
    stageCode: "stage-06",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 10,
    activityKeys: ["face-to-face", "expression-mimicry"],
  },
  {
    key: "gov08-knock-toys",
    title: "两手拿小东西对敲",
    stageCode: "stage-08",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["knock-toys", "rattle-shake"],
  },
  {
    key: "gov08-repeated-syllables",
    title: "发出一连串重复音节（如 lalala、mamama）",
    stageCode: "stage-08",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 15,
    activityKeys: ["babble-response", "conversation-interaction"],
  },
  {
    key: "gov08-stranger-fear",
    title: "对陌生人有害怕等反应",
    stageCode: "stage-08",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 10,
    activityKeys: ["peekaboo", "face-to-face"],
  },
  {
    key: "gov12-stand-seconds",
    title: "不扶东西能自己站数秒",
    stageCode: "stage-12",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["standing-support", "cruising"],
  },
  {
    key: "gov12-bead-bottle",
    title: "能把小丸放进小瓶",
    stageCode: "stage-12",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["pincer-grasp"],
  },
  {
    key: "gov12-understand-nouns",
    title: "听懂 1 个以上物品名",
    stageCode: "stage-12",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 15,
    activityKeys: ["body-parts", "pointing-request"],
  },
  {
    key: "gov12-mimic-actions",
    title: "会模仿他人动作（如拍手）",
    stageCode: "stage-12",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["clapping-game", "expression-mimicry"],
  },
  {
    key: "gov12-emotion-response",
    title: "对他人表情有反应",
    stageCode: "stage-12",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 10,
    activityKeys: ["expression-mimicry", "mirror-play"],
  },
  {
    key: "gov14-hold-rail-stairs",
    title: "扶着墙或栏杆上楼梯",
    stageCode: "stage-14",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 20,
    activityKeys: ["run-jump-play", "cruising"],
  },
  {
    key: "gov14-twist-caps",
    title: "会用手旋拧（拧瓶盖等）",
    stageCode: "stage-14",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["twist-caps"],
  },
  {
    key: "gov14-object-uses",
    title: "知道常用物品用途（杯子喝水、灯会亮）",
    stageCode: "stage-14",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["object-uses", "cup-drinking"],
  },
  {
    key: "gov14-interactive-play",
    title: "能与他人玩互动游戏（如传球）",
    stageCode: "stage-14",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["social-play", "hide-and-seek"],
  },
  {
    key: "gov16-turn-pages-one",
    title: "能一页页地翻书",
    stageCode: "stage-16",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 10,
    activityKeys: ["page-turning", "book-reading"],
  },
  {
    key: "gov16-pretend-play",
    title: "会玩装扮游戏（假装给娃娃喂饭）",
    stageCode: "stage-16",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 15,
    activityKeys: ["pretend-play", "housework-mimic"],
  },
  {
    key: "gov16-potty-signal",
    title: "会主动示意大小便",
    stageCode: "stage-16",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 10,
    activityKeys: ["dress-practice"],
  },
  {
    key: "gov18-jump-forward",
    title: "能双脚向前跳出一段距离",
    stageCode: "stage-18",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["forward-jump", "run-jump-play"],
  },
  {
    key: "gov18-draw-line",
    title: "会模仿画横线",
    stageCode: "stage-18",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["scribble-drawing"],
  },
  {
    key: "gov18-answer-name",
    title: "能回答简单问题（答出自己名字）",
    stageCode: "stage-18",
    skillArea: SkillArea.LANGUAGE,
    thresholdCount: 15,
    activityKeys: ["short-phrases", "conversation-interaction"],
  },
  {
    key: "gov18-stack-train",
    title: "会模仿用积木搭火车、小桥",
    stageCode: "stage-18",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["block-stacking"],
  },
  {
    key: "gov18-take-turns",
    title: "懂得轮流（如排队滑滑梯）",
    stageCode: "stage-18",
    skillArea: SkillArea.SOCIAL_EMOTIONAL,
    thresholdCount: 10,
    activityKeys: ["social-play"],
  },
  {
    key: "gov20-stand-one-foot-5s",
    title: "能单脚站 5 秒以上",
    stageCode: "stage-20",
    skillArea: SkillArea.GROSS_MOTOR,
    thresholdCount: 15,
    activityKeys: ["forward-jump", "run-jump-play"],
  },
  {
    key: "gov20-thread-beads",
    title: "能用绳穿扣子或串珠",
    stageCode: "stage-20",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 15,
    activityKeys: ["bead-threading"],
  },
  {
    key: "gov20-time-concepts",
    title: "理解时间概念（如现在、明天）",
    stageCode: "stage-20",
    skillArea: SkillArea.COGNITIVE,
    thresholdCount: 15,
    activityKeys: ["counting-songs", "short-phrases"],
  },
  {
    key: "gov20-wear-shoes",
    title: "能自己穿鞋子或袜子",
    stageCode: "stage-20",
    skillArea: SkillArea.FINE_MOTOR,
    thresholdCount: 10,
    activityKeys: ["dress-practice"],
  },
];

// ============================================================
// main
// ============================================================
async function main() {
  console.log("🌱 BabyPlan 内容库 Seed 开始...");

  // 清空（幂等）：先删依赖用户数据，再删内容库
  await prisma.completion.deleteMany();
  await prisma.babyMilestoneMark.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.dailyChecklist.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.baby.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.family.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.monthStage.deleteMany();

  // 1. 月龄阶段
  const stageIdByCode = new Map<string, number>();
  for (const s of stages) {
    const created = await prisma.monthStage.create({ data: s });
    stageIdByCode.set(s.code, created.id);
  }
  console.log(`✅ 月龄阶段：${stages.length} 个`);

  // 2. 活动
  const activityIdByKey = new Map<string, string>();
  for (const a of activities) {
    const created = await prisma.activity.create({
      data: {
        title: a.title,
        description: a.description,
        // TODO: 接入开源插图库（Storyset/unDraw）后替换为真实图片 URL
        imageUrl: `/images/activities/${a.key}.svg`,
        dailyTargetCount: a.dailyTargetCount,
        safetyTip: a.safetyTip,
        skillAreas: a.skillAreas,
        scenarios: a.scenarios,
        props: a.props,
        stages: {
          connect: a.stages.map((code) => ({ id: stageIdByCode.get(code)! })),
        },
      },
    });
    activityIdByKey.set(a.key, created.id);
  }
  console.log(`✅ 活动：${activities.length} 个（跨阶段复用）`);

  // 3. 里程碑（显式关联活动）
  for (const m of milestones) {
    await prisma.milestone.create({
      data: {
        title: m.title,
        stageId: stageIdByCode.get(m.stageCode)!,
        skillArea: m.skillArea,
        thresholdCount: m.thresholdCount,
        activities: {
          connect: m.activityKeys.map((k) => ({ id: activityIdByKey.get(k)! })),
        },
      },
    });
  }
  console.log(`✅ 里程碑：${milestones.length} 个（显式关联活动）`);

  // 4. 演示数据：家庭 + 父母 + 婴儿 + 里程碑初始状态
  //    演示婴儿出生 4 个月前 → 月龄 4 → stage-05；预置部分里程碑进度以便演示
  const family = await prisma.family.create({
    data: { creatorId: "demo-parent-mom" },
  });
  await prisma.parent.create({
    data: {
      id: "demo-parent-mom",
      phone: "13800000001",
      passwordHash: "$2b$10$IVOJUcGMWEcQLwSMvZtkLehdW3VM53AyG14HT0xmT3.D8OSg/xLqC",
      nickname: "妈妈",
      isCreator: true,
      familyId: family.id,
    },
  });
  await prisma.parent.create({
    data: {
      id: "demo-parent-dad",
      phone: "13800000002",
      passwordHash: "$2b$10$IVOJUcGMWEcQLwSMvZtkLehdW3VM53AyG14HT0xmT3.D8OSg/xLqC",
      nickname: "爸爸",
      familyId: family.id,
    },
  });
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 4); // 4 个月前出生
  const baby = await prisma.baby.create({
    data: {
      id: "demo-baby",
      nickname: "小星星",
      birthDate: birth,
      gender: "FEMALE",
      familyId: family.id,
    },
  });

  // 初始化该婴儿的里程碑状态（复用应用共享逻辑：当前及之前阶段）
  const markCount = await initBabyMilestones(baby.id, baby.birthDate);

  // 预置演示进度：模拟已坚持完成「俯卧抬头」类活动 20 次（对应俯卧/翻身里程碑）
  const tummyMarks = await prisma.babyMilestoneMark.findMany({
    where: {
      babyId: baby.id,
      milestone: { title: { contains: "抬头" } },
    },
  });
  for (const mk of tummyMarks) {
    await prisma.babyMilestoneMark.update({
      where: { id: mk.id },
      data: { progressCount: 20 },
    });
  }
  console.log(`✅ 演示数据：家庭 + 妈妈/爸爸 + 婴儿「小星星」（4 月龄）+ ${markCount} 条里程碑状态`);

  console.log("🎉 Seed 完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
