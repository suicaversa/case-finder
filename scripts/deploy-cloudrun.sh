#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${REGION:-asia-northeast1}"
SERVICE_NAME="${SERVICE_NAME:-case-finder}"
REPO="${REPO:-cloud-run}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-true}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required. Example: PROJECT_ID=your-gcp-project-id" >&2
  exit 1
fi

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE_NAME}:${IMAGE_TAG}"

# --- GCP Secret Manager secret names (JIREIAI_ prefix) ---
# Secrets must be created in advance:
#   gcloud secrets create JIREIAI_GEMINI_API_KEY --data-file=-
#   gcloud secrets create JIREIAI_DIFY_API_KEY           --data-file=-
#   gcloud secrets create JIREIAI_DATABASE_URL           --data-file=-
#   gcloud secrets create JIREIAI_ACCESS_TOKEN_SECRET    --data-file=-

if ! gcloud artifacts repositories describe "${REPO}" --location "${REGION}" >/dev/null 2>&1; then
  echo "Artifact Registry repo '${REPO}' not found in ${REGION}. Creating..."
  gcloud artifacts repositories create "${REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Cloud Run images"
fi

echo "Building container image: ${IMAGE_URI}"
gcloud builds submit --tag "${IMAGE_URI}" .

echo "Deploying to Cloud Run service: ${SERVICE_NAME}"
DEPLOY_FLAGS=(
  --image "${IMAGE_URI}"
  --region "${REGION}"
  --platform managed
  --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1"
  --set-secrets "GEMINI_API_KEY=JIREIAI_GEMINI_API_KEY:latest,DIFY_API_KEY=JIREIAI_DIFY_API_KEY:latest,DATABASE_URL=JIREIAI_DATABASE_URL:latest,ACCESS_TOKEN_SECRET=JIREIAI_ACCESS_TOKEN_SECRET:latest"
)

if [[ "${ALLOW_UNAUTHENTICATED}" == "true" ]]; then
  DEPLOY_FLAGS+=(--allow-unauthenticated)
else
  DEPLOY_FLAGS+=(--no-allow-unauthenticated)
fi

gcloud run deploy "${SERVICE_NAME}" "${DEPLOY_FLAGS[@]}"

echo "Done."
