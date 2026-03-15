#!/bin/bash

# デプロイ対象のブランチがEntireの場合はビルドをスキップ (exit 0)
if [[ "$VERCEL_GIT_COMMIT_REF" == "entire/checkpoints/v1" ]]; then
  echo "🛑 Entireのcheckpointブランチのため、デプロイをスキップします"
  exit 0
else
  echo "✅ デプロイを実行します"
  exit 1
fi
