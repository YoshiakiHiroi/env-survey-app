// src/survey_json.ts
export const surveyJson = {
  title: "環境データ調査票 (サンプル)",
  description: "事業所のエネルギー使用状況についてご回答ください。",
  pages: [
    {
      name: "basic_info",
      elements: [
        {
          type: "text",
          name: "company_name",
          title: "事業者名",
          isRequired: true
        },
        {
          type: "dropdown",
          name: "business_sector",
          title: "事業区分",
          choices: ["製造業", "サービス業", "小売・卸売業", "その他"]
        }
      ]
    },
    {
      name: "energy_data",
      elements: [
        {
          type: "text",
          name: "electricity_usage",
          title: "月間電力使用量 (kWh)",
          inputType: "number",
          min: 0
        },
        {
          type: "text",
          name: "gas_usage",
          title: "月間ガス使用量 (m3)",
          inputType: "number",
          min: 0
        }
      ]
    }
  ],
  showProgressBar: "top" // 上部に進捗バーを表示
};
