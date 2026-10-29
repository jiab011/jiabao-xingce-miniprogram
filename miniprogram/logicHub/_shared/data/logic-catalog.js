module.exports = {
  questionCount: 2431,
  sourceQuestionCount: 2700,
  wordCount: 8329,
  highThreshold: 5,
  libraries: [{
    id: "idiom-high",
    name: "公考高频成语",
    description: "在至少 5 道去重真题的选项中出现。",
    count: 439
  }, {
    id: "idiom-correct",
    name: "公考正选成语",
    description: "至少一次出现在正确选项中的成语。",
    count: 948
  }, {
    id: "real-high",
    name: "公考高频实词",
    description: "词性表匹配的实词，在至少 5 道去重真题中出现。",
    count: 537
  }, {
    id: "real-correct",
    name: "高频正选实词",
    description: "在至少 5 道去重真题中出现，且至少一次为正确选项。",
    count: 441
  }, {
    id: "national-high",
    name: "国考高频成语",
    description: "在至少 5 道国考去重真题的选项中出现。",
    count: 11
  }, {
    id: "national-all",
    name: "国考历年全部成语",
    description: "本地已收录国考真题选项中的全部已匹配成语。",
    count: 715
  }, {
    id: "all-idioms",
    name: "全部成语",
    description: "本地逻辑填空真题中匹配到的全部成语。",
    count: 2347
  }, {
    id: "all-real",
    name: "全部实词",
    description: "本地逻辑填空真题中匹配词性表的实词。",
    count: 4322
  }, {
    id: "all",
    name: "全部词语",
    description: "本地填空真题选项中提取的词语，包含其他词类和短语。",
    count: 8329
  }]
};
