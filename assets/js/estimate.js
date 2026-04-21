// Consultative, client-side range estimator for estimate.html.
(function initEstimateCalculator() {
  const form = document.querySelector('[data-estimate-form]');
  if (!form) return;

  // Business-editable constants are centralized here for safe future updates.
  const MINIMUM_PROJECT_THRESHOLD = 1500;
  const SERVICE_AREA_CENTER_ZIP = '29445';
  const SERVICE_AREA_RADIUS_MILES = 40;
  const MAX_CUSTOM_SQUARE_FEET = 5000;

  const PROJECT_TYPE_RATE_TABLE = {
    garage: { lowPerSqFt: 8, highPerSqFt: 12 },
    porch: { lowPerSqFt: 7, highPerSqFt: 10.5 },
    pool_deck: { lowPerSqFt: 8.5, highPerSqFt: 13 }
  };

  const PRESET_SIZE_SQFT_TABLE = {
    garage_1_car: 240,
    garage_2_car: 440,
    garage_3_car: 640,
    porch_small: 150,
    porch_medium: 260,
    porch_large: 420,
    pool_deck_small: 320,
    pool_deck_medium: 520,
    pool_deck_large: 760
  };

  // Finish adjustments use multiplicative factors on base rates.
  const FINISH_ADJUSTMENT_TABLE = {
    standard: 1,
    enhanced: 1.12,
    premium: 1.24
  };

  const SURFACE_CONDITION_ADJUSTMENT_TABLE = {
    good: 1,
    fair: 1.1,
    poor: 1.23
  };

  const TIMELINE_ADJUSTMENT_TABLE = {
    asap: 1.07,
    within_30: 1.03,
    within_60: 1,
    planning: 0.99
  };

  const ESTIMATE_DISCLAIMER_TEXT =
    'This is a preliminary budget range, not a final or binding quote. Final pricing is confirmed after project review, surface evaluation, and measurements.';
  const ESTIMATE_DISCLAIMER_VERSION = 'v1-2026-04-21';
  const TRAVEL_FEE_NOTE_TEXT = 'A small travel fee may apply for projects outside our standard service area.';
  const MINIMUM_THRESHOLD_MESSAGE =
    'Most projects we take on begin at $1,500. Based on your selections, your project may be below our standard minimum. We\'re happy to review options and confirm scope with you.';

  // ZIP inference for the 40-mile standard service area around 29445.
  // This intentionally drives message-only behavior, not pricing changes.
  const STANDARD_SERVICE_ZIP_SET = new Set([
    '29445',
    '29405',
    '29406',
    '29407',
    '29410',
    '29412',
    '29414',
    '29418',
    '29420',
    '29456',
    '29464',
    '29466',
    '29483',
    '29485',
    '29492'
  ]);

  const fields = {
    projectType: form.querySelector('#project-type'),
    sizeMode: form.querySelector('#size-mode'),
    presetSize: form.querySelector('#preset-size'),
    customSquareFeet: form.querySelector('#custom-square-feet'),
    environmentType: form.querySelector('#environment-type'),
    surfaceCondition: form.querySelector('#surface-condition'),
    finishType: form.querySelector('#finish-type'),
    timeline: form.querySelector('#timeline'),
    projectAddress: form.querySelector('#project-address'),
    zipCode: form.querySelector('#zip-code'),
    name: form.querySelector('#full-name'),
    phone: form.querySelector('#phone'),
    email: form.querySelector('#email')
  };

  const resultNode = form.querySelector('[data-estimate-output]');
  const previewButton = form.querySelector('[data-estimate-preview]');

  const hiddenFields = {
    estimateRangeLow: form.querySelector('[data-estimate-range-low]'),
    estimateRangeHigh: form.querySelector('[data-estimate-range-high]'),
    estimateRangeDisplay: form.querySelector('[data-estimate-range-display]'),
    estimateProjectType: form.querySelector('[data-estimate-project-type]'),
    estimateSizeMode: form.querySelector('[data-estimate-size-mode]'),
    estimateSizeValueSqft: form.querySelector('[data-estimate-size-value-sqft]'),
    estimateFinishType: form.querySelector('[data-estimate-finish-type]'),
    estimateSurfaceCondition: form.querySelector('[data-estimate-surface-condition]'),
    estimateTimeline: form.querySelector('[data-estimate-timeline]'),
    estimateZip: form.querySelector('[data-estimate-zip]'),
    estimateMinimumThresholdTriggered: form.querySelector('[data-estimate-minimum-threshold-triggered]'),
    estimateTravelNoteTriggered: form.querySelector('[data-estimate-travel-note-triggered]'),
    estimateDisclaimerVersion: form.querySelector('[data-estimate-disclaimer-version]')
  };

  const formatCurrency = value =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);

  const setCustomSizeModeState = () => {
    const sizeMode = fields.sizeMode?.value || '';
    const isCustomMode = sizeMode === 'custom';
    const isPresetMode = sizeMode === 'preset';

    if (fields.customSquareFeet) {
      fields.customSquareFeet.disabled = !isCustomMode;
      fields.customSquareFeet.required = isCustomMode;
      if (!isCustomMode) fields.customSquareFeet.value = '';
      fields.customSquareFeet.setCustomValidity('');
    }

    if (fields.presetSize) {
      fields.presetSize.disabled = !isPresetMode;
      fields.presetSize.required = isPresetMode;
      if (!isPresetMode) fields.presetSize.value = '';
      fields.presetSize.setCustomValidity('');
    }
  };

  const setHiddenFields = payload => {
    hiddenFields.estimateRangeLow.value = payload.estimateRangeLow || '';
    hiddenFields.estimateRangeHigh.value = payload.estimateRangeHigh || '';
    hiddenFields.estimateRangeDisplay.value = payload.estimateRangeDisplay || '';
    hiddenFields.estimateProjectType.value = payload.estimateProjectType || '';
    hiddenFields.estimateSizeMode.value = payload.estimateSizeMode || '';
    hiddenFields.estimateSizeValueSqft.value = payload.estimateSizeValueSqft || '';
    hiddenFields.estimateFinishType.value = payload.estimateFinishType || '';
    hiddenFields.estimateSurfaceCondition.value = payload.estimateSurfaceCondition || '';
    hiddenFields.estimateTimeline.value = payload.estimateTimeline || '';
    hiddenFields.estimateZip.value = payload.estimateZip || '';
    hiddenFields.estimateMinimumThresholdTriggered.value = payload.estimateMinimumThresholdTriggered || 'false';
    hiddenFields.estimateTravelNoteTriggered.value = payload.estimateTravelNoteTriggered || 'false';
    hiddenFields.estimateDisclaimerVersion.value = payload.estimateDisclaimerVersion || '';
  };

  const clearEstimateState = () => {
    resultNode.textContent = 'Fill in project details to preview a planning price range.';
    setHiddenFields({});
  };

  const getFormValues = () => ({
    projectType: fields.projectType?.value.trim() || '',
    sizeMode: fields.sizeMode?.value.trim() || '',
    presetSize: fields.presetSize?.value.trim() || '',
    customSquareFeet: fields.customSquareFeet?.value.trim() || '',
    environmentType: fields.environmentType?.value.trim() || '',
    surfaceCondition: fields.surfaceCondition?.value.trim() || '',
    finishType: fields.finishType?.value.trim() || '',
    timeline: fields.timeline?.value.trim() || '',
    projectAddress: fields.projectAddress?.value.trim() || '',
    zipCode: fields.zipCode?.value.trim() || '',
    name: fields.name?.value.trim() || '',
    phone: fields.phone?.value.trim() || '',
    email: fields.email?.value.trim() || ''
  });

  const validateValues = (values, showFieldGuidance) => {
    const errors = [];

    Object.values(fields).forEach(field => {
      if (field) field.setCustomValidity('');
    });

    const addError = (field, message) => {
      if (!field) return;
      field.setCustomValidity(message);
      errors.push(field);
    };

    if (!values.projectType) addError(fields.projectType, 'Select a project type.');
    if (!values.sizeMode) addError(fields.sizeMode, 'Select how project size should be entered.');

    if (values.sizeMode === 'preset') {
      if (!values.presetSize) addError(fields.presetSize, 'Select a preset size option.');
      if (values.presetSize && !PRESET_SIZE_SQFT_TABLE[values.presetSize]) {
        addError(fields.presetSize, 'Choose a valid preset size option.');
      }
    }

    if (values.sizeMode === 'custom') {
      const customSquareFeet = Number(values.customSquareFeet);
      if (!values.customSquareFeet) {
        addError(fields.customSquareFeet, 'Enter your project square footage.');
      } else if (!Number.isFinite(customSquareFeet) || customSquareFeet <= 0) {
        addError(fields.customSquareFeet, 'Square footage must be a positive number.');
      } else if (customSquareFeet > MAX_CUSTOM_SQUARE_FEET) {
        addError(
          fields.customSquareFeet,
          `Custom square footage must be ${MAX_CUSTOM_SQUARE_FEET.toLocaleString()} or less.`
        );
      }
    }

    if (!values.environmentType) addError(fields.environmentType, 'Select indoor or outdoor.');
    if (!values.surfaceCondition) addError(fields.surfaceCondition, 'Select the current surface condition.');
    if (!values.finishType) addError(fields.finishType, 'Select a finish type.');
    if (!values.timeline) addError(fields.timeline, 'Select your preferred timeline.');

    if (!values.projectAddress) addError(fields.projectAddress, 'Enter the project address.');

    if (!values.zipCode) {
      addError(fields.zipCode, 'Enter a 5-digit ZIP code.');
    } else if (!/^\d{5}$/.test(values.zipCode)) {
      addError(fields.zipCode, 'ZIP code must be exactly 5 digits.');
    }

    if (!values.name) addError(fields.name, 'Enter your name.');
    if (!values.phone) addError(fields.phone, 'Enter a phone number.');
    if (!values.email) addError(fields.email, 'Enter an email address.');

    if (showFieldGuidance && errors.length > 0) {
      errors[0].reportValidity();
      errors[0].focus();
    }

    return errors.length === 0;
  };

  const resolveSquareFeet = values =>
    values.sizeMode === 'custom'
      ? Number(values.customSquareFeet)
      : PRESET_SIZE_SQFT_TABLE[values.presetSize];

  const isOutsideStandardServiceArea = zipCode => {
    if (!/^\d{5}$/.test(zipCode)) return false;
    return !STANDARD_SERVICE_ZIP_SET.has(zipCode);
  };

  const renderEstimateResult = ({ rangeDisplay, thresholdTriggered, travelTriggered }) => {
    const lines = [
      `Estimated budget range: ${rangeDisplay}.`,
      ESTIMATE_DISCLAIMER_TEXT
    ];

    if (thresholdTriggered) lines.push(MINIMUM_THRESHOLD_MESSAGE);
    if (travelTriggered) lines.push(TRAVEL_FEE_NOTE_TEXT);

    lines.push('For exact scope and final pricing, request an in-person quote or call now.');
    resultNode.textContent = lines.join(' ');
  };

  const calculateEstimate = showFieldGuidance => {
    const values = getFormValues();
    const isValid = validateValues(values, showFieldGuidance);

    if (!isValid) {
      clearEstimateState();
      return false;
    }

    const squareFeet = resolveSquareFeet(values);
    const projectRates = PROJECT_TYPE_RATE_TABLE[values.projectType];

    if (!projectRates || !squareFeet) {
      clearEstimateState();
      return false;
    }

    // Required calculation sequence:
    // base rates -> finish adjustment -> surface-condition adjustment -> timeline adjustment -> subtotal.
    const finishFactor = FINISH_ADJUSTMENT_TABLE[values.finishType] || 1;
    const surfaceFactor = SURFACE_CONDITION_ADJUSTMENT_TABLE[values.surfaceCondition] || 1;
    const timelineFactor = TIMELINE_ADJUSTMENT_TABLE[values.timeline] || 1;

    const lowRate = projectRates.lowPerSqFt * finishFactor * surfaceFactor * timelineFactor;
    const highRate = projectRates.highPerSqFt * finishFactor * surfaceFactor * timelineFactor;

    const preliminaryLow = Math.round(lowRate * squareFeet);
    const preliminaryHigh = Math.round(highRate * squareFeet);

    const thresholdTriggered = preliminaryHigh < MINIMUM_PROJECT_THRESHOLD;
    const travelTriggered = isOutsideStandardServiceArea(values.zipCode);
    const rangeDisplay = `${formatCurrency(preliminaryLow)}–${formatCurrency(preliminaryHigh)}`;

    renderEstimateResult({
      rangeDisplay,
      thresholdTriggered,
      travelTriggered
    });

    setHiddenFields({
      estimateRangeLow: String(preliminaryLow),
      estimateRangeHigh: String(preliminaryHigh),
      estimateRangeDisplay: rangeDisplay,
      estimateProjectType: values.projectType,
      estimateSizeMode: values.sizeMode,
      estimateSizeValueSqft: String(squareFeet),
      estimateFinishType: values.finishType,
      estimateSurfaceCondition: values.surfaceCondition,
      estimateTimeline: values.timeline,
      estimateZip: values.zipCode,
      estimateMinimumThresholdTriggered: String(thresholdTriggered),
      estimateTravelNoteTriggered: String(travelTriggered),
      estimateDisclaimerVersion: ESTIMATE_DISCLAIMER_VERSION
    });

    return true;
  };

  previewButton?.addEventListener('click', () => {
    calculateEstimate(true);
  });

  fields.sizeMode?.addEventListener('change', () => {
    setCustomSizeModeState();
    calculateEstimate(false);
  });

  form.addEventListener('input', () => {
    calculateEstimate(false);
  });

  form.addEventListener('change', () => {
    calculateEstimate(false);
  });

  form.addEventListener('submit', event => {
    const isValidEstimate = calculateEstimate(true);
    if (!isValidEstimate) event.preventDefault();
  });

  clearEstimateState();
  setCustomSizeModeState();

  // These constants remain intentionally explicit for business-edit visibility.
  void SERVICE_AREA_CENTER_ZIP;
  void SERVICE_AREA_RADIUS_MILES;
})();
