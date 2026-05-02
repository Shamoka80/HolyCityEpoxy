// Consultative, client-side range estimator for estimate.html.
(function initEstimateCalculator() {
  const form = document.querySelector('[data-estimate-form]');
  if (!form) return;

  // Business-editable constants are centralized here for safe future updates.
  const MINIMUM_PROJECT_THRESHOLD = 1500;
  const SERVICE_AREA_CENTER_ZIP = '29445';
  const SERVICE_AREA_CENTER_COORDINATES = { lat: 33.0377, lng: -80.0331 };
  const SERVICE_AREA_RADIUS_MILES = 40;
  const LOCAL_ADVANTAGE_MAX_MILES = 20;
  const FAIR_DISTANCE_MAX_MILES = 40;
  const MAX_CUSTOM_SQUARE_FEET = 5000;

  const PROJECT_TYPE_RATE_TABLE = {
    garage: { lowPerSqFt: 8, highPerSqFt: 12 },
    porch_patio: { lowPerSqFt: 7.5, highPerSqFt: 11 },
    pool_deck: { lowPerSqFt: 9, highPerSqFt: 14 },
    commercial: { lowPerSqFt: 8.5, highPerSqFt: 16 },
    other_unsure: { lowPerSqFt: 7, highPerSqFt: 14.5 }
  };

  const PRESET_SIZE_SQFT_TABLE = {
    garage_1_car: 240,
    garage_2_car: 440,
    garage_workbench: 520,
    workshop: 600,
    home_gym: 300,
    pool_deck: 420,
    pool_deck_covered: 520,
    pool_lounge_area: 680,
    front_entry_porch: 140,
    covered_porch: 240,
    back_porch: 320,
    patio: 380,
    walkway: 180,
    auto_shop: 1400,
    service_bay: 1000,
    showroom: 1800,
    warehouse: 3000,
    light_commercial: 2200
  };

  const PROJECT_TYPE_PRESET_TABLE = {
    garage: ['garage_1_car', 'garage_2_car', 'garage_workbench', 'workshop', 'home_gym'],
    pool_deck: ['pool_deck', 'pool_deck_covered', 'pool_lounge_area'],
    porch_patio: ['front_entry_porch', 'covered_porch', 'back_porch', 'patio', 'walkway'],
    commercial: ['auto_shop', 'service_bay', 'showroom', 'warehouse', 'light_commercial'],
    other_unsure: Object.keys(PRESET_SIZE_SQFT_TABLE)
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
    'Final pricing depends on square footage, concrete condition, surface preparation, repairs, moisture conditions, and selected coating system.';
  const ESTIMATE_DISCLAIMER_VERSION = 'v2-2026-04-22';
  const MINIMUM_THRESHOLD_MESSAGE =
    'Most projects we take on begin at $1,500. Based on your selections, your project may be below our standard minimum. We\'re happy to review options and confirm scope with you.';

  const TRAVEL_POLICY = {
    local: {
      key: 'local_advantage',
      label: 'Local Advantage Zone',
      fee: 0,
      creditNote: 'No travel fee applies in this zone.',
      details:
        'Free on-site estimate, no travel fees, and priority scheduling apply for projects within 20 miles of 29445.',
      virtualEstimateRequired: false
    },
    fair: {
      key: 'fair_distance',
      label: 'Fair-Distance Zone',
      fee: 49,
      creditNote: '$49 fee is credited when booking.',
      details:
        'For projects 20 to 40 miles from 29445, a $49 fee applies and is credited when booking.',
      virtualEstimateRequired: false
    },
    premium: {
      key: 'premium_out_of_area',
      label: 'Premium Out-of-Area Zone',
      fee: 99,
      creditNote: '$99 fee is credited when booking.',
      details:
        'For projects beyond 40 miles from 29445, virtual estimate first, then a $99 fee applies and is credited when booking.',
      virtualEstimateRequired: true
    }
  };

  // ZIP centroid lookup for Charleston and surrounding service communities.
  // Distances are estimated from ZIP centroid to ZIP 29445 centroid.
  const ZIP_COORDINATE_TABLE = {
    '29061': { lat: 33.9192, lng: -80.8087 },
    '29072': { lat: 33.9304, lng: -81.2522 },
    '29115': { lat: 33.4952, lng: -80.8576 },
    '29118': { lat: 33.9001, lng: -80.8954 },
    '29401': { lat: 32.7795, lng: -79.9311 },
    '29403': { lat: 32.7982, lng: -79.9627 },
    '29405': { lat: 32.8571, lng: -79.9827 },
    '29406': { lat: 32.9208, lng: -80.0169 },
    '29407': { lat: 32.8028, lng: -80.0042 },
    '29410': { lat: 32.9788, lng: -80.0325 },
    '29412': { lat: 32.7163, lng: -79.9631 },
    '29414': { lat: 32.8385, lng: -80.0848 },
    '29418': { lat: 32.8796, lng: -80.069 },
    '29420': { lat: 32.9352, lng: -80.133 },
    '29429': { lat: 33.1894, lng: -80.0124 },
    '29431': { lat: 33.3862, lng: -79.2956 },
    '29436': { lat: 33.1891, lng: -80.4364 },
    '29440': { lat: 33.3655, lng: -79.3237 },
    '29445': { lat: 33.0377, lng: -80.0331 },
    '29449': { lat: 32.7446, lng: -80.1725 },
    '29451': { lat: 32.7575, lng: -79.7912 },
    '29455': { lat: 32.6496, lng: -80.1965 },
    '29456': { lat: 33.0656, lng: -80.1383 },
    '29458': { lat: 32.9861, lng: -79.9289 },
    '29461': { lat: 33.1768, lng: -80.0091 },
    '29464': { lat: 32.8274, lng: -79.8549 },
    '29466': { lat: 32.905, lng: -79.8019 },
    '29468': { lat: 32.6576, lng: -80.4602 },
    '29470': { lat: 33.2058, lng: -79.9468 },
    '29472': { lat: 32.8922, lng: -80.2974 },
    '29474': { lat: 33.1978, lng: -80.6506 },
    '29476': { lat: 32.9966, lng: -80.4329 },
    '29479': { lat: 33.0105, lng: -80.1697 },
    '29481': { lat: 33.5614, lng: -79.6227 },
    '29483': { lat: 33.0185, lng: -80.1766 },
    '29485': { lat: 32.9648, lng: -80.1792 },
    '29486': { lat: 33.0972, lng: -80.0137 },
    '29487': { lat: 33.521, lng: -80.3303 },
    '29488': { lat: 32.4312, lng: -80.6698 },
    '29492': { lat: 32.9098, lng: -79.9127 },
    '29493': { lat: 33.0562, lng: -80.2283 }
  };

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
  const presetOptions = fields.presetSize ? Array.from(fields.presetSize.options).filter(option => option.value) : [];

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
    estimateTravelZone: form.querySelector('[data-estimate-travel-zone]'),
    estimateDistanceMiles: form.querySelector('[data-estimate-distance-miles]'),
    estimateTravelFee: form.querySelector('[data-estimate-travel-fee]'),
    estimateTravelFeeCreditNote: form.querySelector('[data-estimate-travel-fee-credit-note]'),
    estimateVirtualEstimateRequired: form.querySelector('[data-estimate-virtual-estimate-required]'),
    estimateMinimumThresholdTriggered: form.querySelector('[data-estimate-minimum-threshold-triggered]'),
    estimateTravelNoteTriggered: form.querySelector('[data-estimate-travel-note-triggered]'),
    estimateDisclaimerVersion: form.querySelector('[data-estimate-disclaimer-version]'),
    estimateDisclaimerText: form.querySelector('[data-estimate-disclaimer-text]')
  };

  const formatCurrency = value =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);

  const formatMiles = value => `${value.toFixed(1)} miles`;

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


  const updatePresetOptionsByProjectType = () => {
    if (!fields.presetSize) return;
    const projectType = fields.projectType?.value || '';
    const allowedPresets = projectType ? PROJECT_TYPE_PRESET_TABLE[projectType] || [] : [];
    const currentPreset = fields.presetSize.value;
    let selectedIsAllowed = false;

    presetOptions.forEach(option => {
      const isAllowed = allowedPresets.includes(option.value);
      option.hidden = !!projectType && !isAllowed;
      option.disabled = !!projectType && !isAllowed;
      if (option.value === currentPreset && isAllowed) selectedIsAllowed = true;
    });

    if (currentPreset && !selectedIsAllowed) fields.presetSize.value = '';
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
    hiddenFields.estimateTravelZone.value = payload.estimateTravelZone || '';
    hiddenFields.estimateDistanceMiles.value = payload.estimateDistanceMiles || '';
    hiddenFields.estimateTravelFee.value = payload.estimateTravelFee || '';
    hiddenFields.estimateTravelFeeCreditNote.value = payload.estimateTravelFeeCreditNote || '';
    hiddenFields.estimateVirtualEstimateRequired.value = payload.estimateVirtualEstimateRequired || 'false';
    hiddenFields.estimateMinimumThresholdTriggered.value = payload.estimateMinimumThresholdTriggered || 'false';
    hiddenFields.estimateTravelNoteTriggered.value = payload.estimateTravelNoteTriggered || 'false';
    hiddenFields.estimateDisclaimerVersion.value = payload.estimateDisclaimerVersion || '';
    hiddenFields.estimateDisclaimerText.value = payload.estimateDisclaimerText || '';
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
      const allowedPresets = PROJECT_TYPE_PRESET_TABLE[values.projectType] || [];
      if (values.presetSize && values.projectType && !allowedPresets.includes(values.presetSize)) {
        addError(fields.presetSize, 'Select a preset size that matches the selected project type.');
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

  const toRadians = degrees => (degrees * Math.PI) / 180;

  const haversineMiles = (origin, destination) => {
    const earthRadiusMiles = 3958.8;
    const dLat = toRadians(destination.lat - origin.lat);
    const dLng = toRadians(destination.lng - origin.lng);
    const lat1 = toRadians(origin.lat);
    const lat2 = toRadians(destination.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const resolveTravelPolicy = zipCode => {
    const zipCoordinates = ZIP_COORDINATE_TABLE[zipCode] || null;
    const distanceMiles = zipCoordinates
      ? haversineMiles(SERVICE_AREA_CENTER_COORDINATES, zipCoordinates)
      : FAIR_DISTANCE_MAX_MILES + 0.1;

    const roundedDistanceMiles = Math.round(distanceMiles * 10) / 10;

    if (roundedDistanceMiles <= LOCAL_ADVANTAGE_MAX_MILES) {
      return {
        ...TRAVEL_POLICY.local,
        distanceMiles: roundedDistanceMiles,
        distanceLabel: formatMiles(roundedDistanceMiles),
        isDistanceEstimated: !zipCoordinates
      };
    }

    if (roundedDistanceMiles <= FAIR_DISTANCE_MAX_MILES) {
      return {
        ...TRAVEL_POLICY.fair,
        distanceMiles: roundedDistanceMiles,
        distanceLabel: formatMiles(roundedDistanceMiles),
        isDistanceEstimated: !zipCoordinates
      };
    }

    return {
      ...TRAVEL_POLICY.premium,
      distanceMiles: roundedDistanceMiles,
      distanceLabel: zipCoordinates ? formatMiles(roundedDistanceMiles) : '40+ miles',
      isDistanceEstimated: !zipCoordinates
    };
  };

  const renderEstimateResult = ({ rangeDisplay, thresholdTriggered, travelPolicy }) => {
    const lines = [
      `Estimated project range: ${rangeDisplay}.`,
      ESTIMATE_DISCLAIMER_TEXT,
      `Estimated distance from ${SERVICE_AREA_CENTER_ZIP}: ${travelPolicy.distanceLabel}.`,
      `${travelPolicy.label}: ${travelPolicy.details}`,
      travelPolicy.creditNote
    ];

    if (travelPolicy.virtualEstimateRequired) {
      lines.push('Virtual estimate is required first. Upload photos and measurements to receive a preliminary quote range.');
    } else {
      lines.push('Virtual estimate is available in all zones. Upload photos and measurements for a faster preliminary quote range.');
    }

    if (travelPolicy.isDistanceEstimated) {
      lines.push('Distance was estimated from ZIP-level data and will be confirmed during scheduling.');
    }

    if (thresholdTriggered) lines.push(MINIMUM_THRESHOLD_MESSAGE);

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

    const environmentHighFactor = values.environmentType === 'outdoor' ? 1.06 : 1;
    const complexityHighFactor = values.projectType === 'commercial' || values.projectType === 'other_unsure' ? 1.08 : 1.03;
    const uncertaintyFactor = values.sizeMode === 'custom' ? 1.02 : 1;
    const preliminaryLow = Math.round(lowRate * squareFeet);
    const preliminaryHigh = Math.round(highRate * squareFeet * environmentHighFactor * complexityHighFactor * uncertaintyFactor);

    const travelPolicy = resolveTravelPolicy(values.zipCode);
    const thresholdTriggered = preliminaryHigh < MINIMUM_PROJECT_THRESHOLD;
    const travelTriggered = travelPolicy.fee > 0;
    const rangeDisplay = `${formatCurrency(preliminaryLow)}–${formatCurrency(preliminaryHigh)}`;

    renderEstimateResult({
      rangeDisplay,
      thresholdTriggered,
      travelPolicy
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
      estimateTravelZone: travelPolicy.key,
      estimateDistanceMiles: String(travelPolicy.distanceMiles),
      estimateTravelFee: String(travelPolicy.fee),
      estimateTravelFeeCreditNote: travelPolicy.creditNote,
      estimateVirtualEstimateRequired: String(travelPolicy.virtualEstimateRequired),
      estimateMinimumThresholdTriggered: String(thresholdTriggered),
      estimateTravelNoteTriggered: String(travelTriggered),
      estimateDisclaimerVersion: ESTIMATE_DISCLAIMER_VERSION,
      estimateDisclaimerText: ESTIMATE_DISCLAIMER_TEXT
    });

    return true;
  };

  previewButton?.addEventListener('click', () => {
    calculateEstimate(true);
  });

  fields.projectType?.addEventListener('change', () => {
    updatePresetOptionsByProjectType();
    calculateEstimate(false);
  });

  fields.sizeMode?.addEventListener('change', () => {
    setCustomSizeModeState();
    updatePresetOptionsByProjectType();
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
  updatePresetOptionsByProjectType();

  // These constants remain intentionally explicit for business-edit visibility.
  void SERVICE_AREA_CENTER_ZIP;
  void SERVICE_AREA_RADIUS_MILES;
})();
