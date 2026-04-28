import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css"; // SurveyJSの標準テーマをインポート
import { surveyJson } from "./schemas/kix/kix-food-env-survey"; // 先ほど作成したJSONをインポート

function App() {
  // アンケートモデルを作成
  const survey = new Model(surveyJson);

  // 回答完了時の処理
  survey.onComplete.add((sender) => {
    console.log("回答結果:", sender.data);
    alert("アンケートへの回答ありがとうございます。");
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* アンケート画面を表示 */}
      <Survey model={survey} />
    </div>
  );
}

export default App;
