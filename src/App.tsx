import { useMemo } from "react";
import { Model, surveyLocalization } from "survey-core";
import "survey-core/i18n/japanese";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css"; // SurveyJSの標準テーマをインポート
import { surveyJson } from "./schemas/kix/kix-food-env-survey"; // 先ほど作成したJSONをインポート
import type { IKixEnvResponse } from "./schemas/kix/types";

surveyLocalization.currentLocale = "ja";

function App() {
  // アンケートモデルを作成
  const survey = useMemo(() => {
    const surveyModel = new Model(surveyJson);

    // 回答完了時の処理
    surveyModel.onComplete.add((sender) => {
      const data = sender.data as IKixEnvResponse;
      console.log("回答結果:", data);
      alert("アンケートへの回答ありがとうございます。");
    });

    return surveyModel;
  }, []);

  return (
    <main className="app-shell">
      <Survey model={survey} />
    </main>
  );
}

export default App;
