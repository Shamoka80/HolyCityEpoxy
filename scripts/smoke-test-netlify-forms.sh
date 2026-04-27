#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${SITE_URL:-https://holycityepoxy.com}"
SITE_URL="${SITE_URL%/}"
POST_PATH="${POST_PATH:-/thank-you.html}"
THROTTLE_SECONDS="${THROTTLE_SECONDS:-6}"
OUTPUT_DIR="${OUTPUT_DIR:-ci-artifacts/form-smoke}"

mkdir -p "${OUTPUT_DIR}"
REPORT_FILE="${OUTPUT_DIR}/results.md"
JSONL_FILE="${OUTPUT_DIR}/results.jsonl"

: > "${REPORT_FILE}"
: > "${JSONL_FILE}"

TIMESTAMP_UTC="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${GITHUB_RUN_ID:-local}"
RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-0}"
MARKER="CI-SMOKE-${RUN_ID}-${RUN_ATTEMPT}-${TIMESTAMP_UTC}"

printf '# Netlify form smoke results\n\n' >> "${REPORT_FILE}"
printf -- '- Site URL: `%s`\n' "${SITE_URL}" >> "${REPORT_FILE}"
printf -- '- Marker: `%s`\n' "${MARKER}" >> "${REPORT_FILE}"
printf -- '- Timestamp (UTC): `%s`\n\n' "${TIMESTAMP_UTC}" >> "${REPORT_FILE}"

pass_count=0
fail_count=0

record_result() {
  local form_name="$1"
  local status="$2"
  local location="$3"
  local pass_fail="$4"
  local detail="$5"

  printf '{"form":"%s","status":%s,"location":"%s","result":"%s","detail":"%s"}\n' \
    "${form_name}" "${status}" "${location}" "${pass_fail}" "${detail}" >> "${JSONL_FILE}"

  if [[ "${pass_fail}" == "PASS" ]]; then
    printf -- '- ✅ `%s` status `%s`, location `%s` — %s\n' "${form_name}" "${status}" "${location}" "${detail}" >> "${REPORT_FILE}"
    pass_count=$((pass_count + 1))
  else
    printf -- '- ❌ `%s` status `%s`, location `%s` — %s\n' "${form_name}" "${status}" "${location}" "${detail}" >> "${REPORT_FILE}"
    fail_count=$((fail_count + 1))
  fi
}

submit_and_check() {
  local form_name="$1"
  local payload="$2"

  local response_headers
  local response_body
  response_headers="$(mktemp)"
  response_body="$(mktemp)"

  local http_status
  http_status="$(curl -sS -o "${response_body}" -D "${response_headers}" \
    --request POST "${SITE_URL}${POST_PATH}" \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --header "User-Agent: HolyCityEpoxyFormSmoke/1.0 (${MARKER})" \
    --data "${payload}" \
    --write-out '%{http_code}')"

  local location
  location="$(awk 'BEGIN{IGNORECASE=1} /^location:/{print $2}' "${response_headers}" | tr -d '\r' | tail -n 1)"

  local detail
  detail=""

  if [[ "${http_status}" =~ ^2[0-9][0-9]$ ]]; then
    detail="2xx accepted"
    record_result "${form_name}" "${http_status}" "${location:-n/a}" "PASS" "${detail}"
  elif [[ "${http_status}" =~ ^3[0-9][0-9]$ ]]; then
    if [[ -n "${location}" && "${location}" == *"/thank-you.html"* ]]; then
      detail="redirected to thank-you page"
      record_result "${form_name}" "${http_status}" "${location}" "PASS" "${detail}"
    else
      detail="redirect missing expected /thank-you.html"
      record_result "${form_name}" "${http_status}" "${location:-n/a}" "FAIL" "${detail}"
    fi
  else
    detail="unexpected status code"
    record_result "${form_name}" "${http_status}" "${location:-n/a}" "FAIL" "${detail}"
  fi

  rm -f "${response_headers}" "${response_body}"
}

estimate_payload="form-name=estimate-consultative-request&name=CI%20Estimate%20${MARKER}&phone=8435550101&email=ci-estimate-${RUN_ID}-${RUN_ATTEMPT}@example.com&project_type=garage&size_mode=preset&preset_size=garage_2_car&custom_square_feet=&environment_type=indoor&surface_condition=good&finish_type=full_flake&timeline=2_4_weeks&project_address=CI%20Smoke%20Test&zip_code=29445&estimate_range_low=2500&estimate_range_high=4000&estimate_range_display=%242500-%244000&estimate_project_type=garage&estimate_size_mode=preset&estimate_size_value_sqft=450&estimate_finish_type=full_flake&estimate_surface_condition=good&estimate_timeline=2_4_weeks&estimate_zip=29445&estimate_travel_zone=0_20&estimate_distance_miles=10&estimate_travel_fee=0&estimate_virtual_estimate_required=false&estimate_minimum_threshold_triggered=false&estimate_travel_note_triggered=false&ci_test_marker=${MARKER}"

contact_payload="form-name=contact-homeowner-request&name=CI%20Contact%20${MARKER}&phone=8435550102&email=ci-contact-${RUN_ID}-${RUN_ATTEMPT}@example.com&project_type=Garage&message=Automated%20CI%20smoke%20test%20marker%20${MARKER}&ci_test_marker=${MARKER}"

submit_and_check "estimate-consultative-request" "${estimate_payload}"
sleep "${THROTTLE_SECONDS}"
submit_and_check "contact-homeowner-request" "${contact_payload}"

printf '\n- Pass count: `%s`\n- Fail count: `%s`\n' "${pass_count}" "${fail_count}" >> "${REPORT_FILE}"

cat "${REPORT_FILE}"

if [[ "${fail_count}" -gt 0 ]]; then
  exit 1
fi
