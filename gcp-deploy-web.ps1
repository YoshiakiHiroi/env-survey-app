# ローカルでコンテナをビルドする場合
# docker build -t env-survey-backend-local .
# gcloudの認証が切れた場合
# gcloud auth login
# gcloud auth application-default login

param(
  # 開発者名（'hiroi','oki', etc...）
  # 指定しない場合は、通常のデモ環境としてデプロイ
  [string]$DEVELOPER = ""
)
Write-Host "Developer: $DEVELOPER"

# --------------------------------------------------
# 1. 変数の設定
# --------------------------------------------------
# サフィックスとプリフィックス
if (-not [string]::IsNullOrEmpty($DEVELOPER)) {
    # 空でない場合：ハイフンを付ける
    $SUFFIX = "-$DEVELOPER"
    $PREFIX = "$DEVELOPER."
} else {
    # 空の場合：空白にする
    $SUFFIX = ""
    $PREFIX = ""
}
Write-Host "Suffix: $SUFFIX"
Write-Host "Prefix: $PREFIX"

# プロジェクトIDを取得し、変数に格納します
$PROJECT_ID = "it-development-sandbox-452923"
Write-Host "Project ID: $PROJECT_ID"

# デプロイ先のリージョン
$REGION = "asia-northeast1"
Write-Host "Region: $REGION"

# Artifact Registryに作成したリポジトリ名（フロントエンド用）
$REPO_NAME = "env-survey-dev-frontend-repo-tokyo${SUFFIX}"
Write-Host "Repository Name: $REPO_NAME"

# Cloud Runにデプロイするサービス名（フロントエンド用）
$APP_NAME = "env-survey-dev-frontend-run-tokyo${SUFFIX}"
Write-Host "App Name: $APP_NAME"

# Cloud Runサービスを実行するサービスアカウント（フロントエンド用）
$SERVICE_ACCOUNT_EMAIL = "env-survey-dev-frontend-runner@${PROJECT_ID}.iam.gserviceaccount.com"
Write-Host "Service Account: $SERVICE_ACCOUNT_EMAIL"

# Cloud Buildに渡す置換変数を配列として定義
$substitutions = @(
    "_PREFIX=$PREFIX",
    "_REPO_NAME=$REPO_NAME",
    "_APP_NAME=$APP_NAME",
    "_SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_EMAIL",
    "_REGION=$REGION"
) -join "," # 配列の各要素をカンマで結合する

# --------------------------------------------------
# 2. Cloud Buildの実行
# --------------------------------------------------
gcloud beta builds submit --config=cloudbuild-dev.yaml --region=$REGION `
  --substitutions="$substitutions"

