// Lightweight client-side estimator for consultative planning ranges.
(function initEstimateCalculator() {
  const form = document.querySelector('[data-estimate-form]');
  if (!form) return;

  // Editable pricing constants.
  const BASE_RANGE_BY_PROJECT = {
    garage: { lowPerSqFt: 8, highPerSqFt: 12 },
    porch: { lowPerSqFt: 7, highPerSqFt: 11 },
    'pool-deck': { lowPerSqFt: 8.5, highPerSqFt: 13 }
  };

  const SIZE_PRESET_SQFT = {
    small: 250,
    medium: 450,
    large: 800
  };

  const ENVIRONMENT_MULTIPLIER = {
    indoor: 1,
    outdoor: 1.08
  };

  const PREP_MULTIPLIER = {
    good: 1,
    'minor-repairs': 1.08,
    'moderate-repairs': 1.18,
    'extensive-repairs': 1.32
  };

  const FINISH_MULTIPLIER = {
    solid: 1,
    'decorative-flake': 1.12,
    quartz: 1.2,
    'premium-uv': 1.28
  };

  const TIMELINE_MULTIPLIER = {
    asap: 1.08,
    'within-30': 1.04,
    'within-60': 1,
    planning: 0.98
  };

  const MINIMUM_PROJECT_THRESHOLD = 1500;
  const RANGE_MARGIN = 0.08;

  // Optional placeholder travel logic (customer-facing language stays generic).
  const STANDARD_SERVICE_ZIPS = new Set(['29445', '29485', '29456', '29483', '29405', '29406', '29410', '29412', '29464']);

  const sizePresetField = form.querySelector('#size-preset');
  const customSqFtField = form.querySelector('#custom-square-feet');
  const resultNode = form.querySelector('[data-estimate-output]');

  const hiddenLow = form.querySelector('[data-estimate-low]');
  const hiddenHigh = form.querySelector('[data-estimate-high]');
  const hiddenDisplay = form.querySelector('[data-estimate-display]');
  const hiddenNote = form.querySelector('[data-estimate-note]');
  const hiddenTravel = form.querySelector('[data-travel-note]');

  const formatCurrency = value =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);

  const getSqFt = () => {
    if (!sizePresetField) return null;
    const preset = sizePresetField.value;
    if (!preset) return null;
    if (preset === 'custom') {
      const custom = Number(customSqFtField?.value || 0);
      return custom > 0 ? custom : null;
    }
    return SIZE_PRESET_SQFT[preset] || null;
  };

  const getTravelNote = zip => {
    if (!zip || zip.length !== 5) return '';
    if (STANDARD_SERVICE_ZIPS.has(zip)) return '';
    return 'Projects outside our standard service area may include a small travel fee.';
  };

  const updateCustomSqFtState = () => {
    if (!sizePresetField || !customSqFtField) return;
    const enabled = sizePresetField.value === 'custom';
    customSqFtField.disabled = !enabled;
    customSqFtField.required = enabled;
    if (!enabled) customSqFtField.value = '';
  };

  const setHiddenFields = payload => {
    hiddenLow.value = payload.low || '';
    hiddenHigh.value = payload.high || '';
    hiddenDisplay.value = payload.display || '';
    hiddenNote.value = payload.note || '';
    hiddenTravel.value = payload.travel || '';
  };

  const clearResult = () => {
    resultNode.textContent = 'Fill in project details to preview a planning price range.';
    setHiddenFields({});
  };

  const calculateRange = () => {
    const formData = new FormData(form);

    const projectType = String(formData.get('project_type') || '');
    const sqft = getSqFt();
    const environment = String(formData.get('environment') || '');
    const prep = String(formData.get('surface_condition') || '');
    const finish = String(formData.get('finish_type') || '');
    const timeline = String(formData.get('timeline') || '');
    const zipCode = String(formData.get('zip_code') || '');

    if (!projectType || !sqft || !environment || !prep || !finish || !timeline) {
      clearResult();
      return;
    }

    const base = BASE_RANGE_BY_PROJECT[projectType];
    if (!base) {
      clearResult();
      return;
    }

    const multiplier =
      (ENVIRONMENT_MULTIPLIER[environment] || 1) *
      (PREP_MULTIPLIER[prep] || 1) *
      (FINISH_MULTIPLIER[finish] || 1) *
      (TIMELINE_MULTIPLIER[timeline] || 1);

    let low = base.lowPerSqFt * sqft * multiplier;
    let high = base.highPerSqFt * sqft * multiplier;

    low *= 1 - RANGE_MARGIN;
    high *= 1 + RANGE_MARGIN;

    const travelNote = getTravelNote(zipCode);

    // Minimum project threshold handling with consultative customer language.
    if (high < MINIMUM_PROJECT_THRESHOLD) {
      const minMsg =
        'Most projects fall within a higher investment range due to preparation and system installation. ' +
        'Please contact us to discuss the best options for your space.';
      resultNode.textContent = minMsg;
      setHiddenFields({
        low: String(Math.round(low)),
        high: String(Math.round(high)),
        display: 'Below typical minimum threshold',
        note: minMsg,
        travel: travelNote
      });
      return;
    }

    const display = `${formatCurrency(low)} – ${formatCurrency(high)}`;
    const note =
      'Planning range only. Final pricing is confirmed after an in-person project review and surface assessment.';
    resultNode.textContent = travelNote ? `${display}. ${note} ${travelNote}` : `${display}. ${note}`;

    setHiddenFields({
      low: String(Math.round(low)),
      high: String(Math.round(high)),
      display,
      note,
      travel: travelNote
    });
  };

  sizePresetField?.addEventListener('change', () => {
    updateCustomSqFtState();
    calculateRange();
  });

  customSqFtField?.addEventListener('input', calculateRange);
  form.addEventListener('input', calculateRange);
  form.addEventListener('change', calculateRange);

  updateCustomSqFtState();
})();
