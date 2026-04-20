/*
  Estimate configuration values
  Update these constants to tune pricing guidance without changing calculation logic.
*/
const ESTIMATE_CONFIG = {
  minimumInvestment: 1500,
  baseRatePerSqFt: {
    garage: { low: 6.75, high: 9.5 },
    porch: { low: 7.5, high: 10.5 },
    pool_deck: { low: 8.25, high: 11.75 },
  },
  sizePresetsSqFt: {
    small: 250,
    medium: 450,
    large: 750,
    xlarge: 1050,
  },
  multipliers: {
    environment: {
      indoor: { low: 1, high: 1 },
      outdoor: { low: 1.08, high: 1.14 },
    },
    surface_condition: {
      good: { low: 1, high: 1.06 },
      minor_repairs: { low: 1.12, high: 1.2 },
      moderate_repairs: { low: 1.2, high: 1.34 },
      extensive_repairs: { low: 1.32, high: 1.5 },
    },
    finish_type: {
      solid: { low: 1, high: 1.08 },
      decorative_flake: { low: 1.1, high: 1.22 },
      quartz: { low: 1.2, high: 1.35 },
      premium_uv: { low: 1.24, high: 1.4 },
    },
    timeline: {
      asap: { low: 1.06, high: 1.14 },
      '30_days': { low: 1.02, high: 1.08 },
      '60_days': { low: 1, high: 1.04 },
      planning: { low: 0.98, high: 1.02 },
    },
  },
  localServiceZipCodes: new Set([
    '29445', '29485', '29483', '29456', '29466', '29464', '29492', '29420', '29418', '29406', '29405', '29403', '29401', '29407', '29412', '29414', '29455', '29439', '29449', '29470', '29461',
  ]),
  messages: {
    rangePrefix: 'Planning Estimate Range',
    minimum:
      'Most projects fall within a higher investment range due to preparation and full system installation. We would be glad to discuss practical options for your space.',
    travel:
      'Based on your project location, a small travel fee may apply. We will confirm this clearly before scheduling.',
    finalNote:
      'This is a planning range only. Final pricing is confirmed after an on-site review.',
  },
};

(function initEstimator() {
  const form = document.querySelector('[data-estimate-form]');
  if (!form) {
    return;
  }

  const fields = {
    projectType: form.querySelector('#project-type'),
    sizePreset: form.querySelector('#size-preset'),
    customSize: form.querySelector('#custom-square-feet'),
    customSizeGroup: form.querySelector('[data-custom-size-group]'),
    environment: form.querySelector('#environment'),
    surfaceCondition: form.querySelector('#surface-condition'),
    finishType: form.querySelector('#finish-type'),
    timeline: form.querySelector('#timeline'),
    zipCode: form.querySelector('#zip'),
    estimateRangeField: form.querySelector('[data-estimate-range-field]'),
    estimateBandField: form.querySelector('[data-estimate-band-field]'),
    travelNoteField: form.querySelector('[data-travel-note-field]'),
    estimateResult: form.querySelector('[data-estimate-result]'),
    travelNote: form.querySelector('[data-travel-note]'),
  };

  function currency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getSquareFootage() {
    if (fields.sizePreset.value === 'custom') {
      const customValue = Number.parseInt(fields.customSize.value, 10);
      return Number.isFinite(customValue) ? customValue : 0;
    }

    return ESTIMATE_CONFIG.sizePresetsSqFt[fields.sizePreset.value] || 0;
  }

  function getMultiplier(tableName, key) {
    const table = ESTIMATE_CONFIG.multipliers[tableName] || {};
    return table[key] || { low: 1, high: 1 };
  }

  function calculateRange() {
    const sqFt = getSquareFootage();
    const projectType = fields.projectType.value;

    if (!sqFt || !ESTIMATE_CONFIG.baseRatePerSqFt[projectType]) {
      return null;
    }

    const baseRate = ESTIMATE_CONFIG.baseRatePerSqFt[projectType];

    const environmentMultiplier = getMultiplier('environment', fields.environment.value);
    const conditionMultiplier = getMultiplier('surface_condition', fields.surfaceCondition.value);
    const finishMultiplier = getMultiplier('finish_type', fields.finishType.value);
    const timelineMultiplier = getMultiplier('timeline', fields.timeline.value);

    const lowTotal =
      sqFt *
      baseRate.low *
      environmentMultiplier.low *
      conditionMultiplier.low *
      finishMultiplier.low *
      timelineMultiplier.low;

    const highTotal =
      sqFt *
      baseRate.high *
      environmentMultiplier.high *
      conditionMultiplier.high *
      finishMultiplier.high *
      timelineMultiplier.high;

    return {
      low: Math.round(lowTotal / 50) * 50,
      high: Math.round(highTotal / 50) * 50,
      sqFt,
    };
  }

  function getTravelMessage(zipCode) {
    if (/^\d{5}$/.test(zipCode) && !ESTIMATE_CONFIG.localServiceZipCodes.has(zipCode)) {
      return ESTIMATE_CONFIG.messages.travel;
    }

    return '';
  }

  function updateCustomSizeState() {
    const isCustom = fields.sizePreset.value === 'custom';
    fields.customSizeGroup.hidden = !isCustom;
    fields.customSize.required = isCustom;

    if (!isCustom) {
      fields.customSize.value = '';
    }
  }

  function updateEstimate() {
    const range = calculateRange();

    if (!range) {
      fields.estimateResult.textContent = 'Select your project details to generate a planning estimate range.';
      fields.estimateRangeField.value = '';
      fields.estimateBandField.value = '';
      return;
    }

    const belowMinimum = range.high < ESTIMATE_CONFIG.minimumInvestment;
    const formattedRange = `${currency(range.low)} - ${currency(range.high)}`;

    fields.estimateRangeField.value = formattedRange;
    fields.estimateBandField.value = belowMinimum ? 'Below minimum investment range' : 'Standard investment range';

    if (belowMinimum) {
      fields.estimateResult.textContent = `${ESTIMATE_CONFIG.messages.minimum} ${ESTIMATE_CONFIG.messages.finalNote}`;
      return;
    }

    fields.estimateResult.textContent = `${ESTIMATE_CONFIG.messages.rangePrefix}: ${formattedRange}. ${ESTIMATE_CONFIG.messages.finalNote}`;
  }

  function updateTravelNote() {
    const zipCode = fields.zipCode.value.trim();
    const travelMessage = getTravelMessage(zipCode);

    fields.travelNote.textContent = travelMessage;
    fields.travelNoteField.value = travelMessage;
  }

  form.addEventListener('input', (event) => {
    if (event.target === fields.sizePreset) {
      updateCustomSizeState();
    }

    if (event.target === fields.zipCode) {
      updateTravelNote();
    }

    updateEstimate();
  });

  form.addEventListener('change', () => {
    updateCustomSizeState();
    updateTravelNote();
    updateEstimate();
  });

  form.addEventListener('submit', () => {
    updateCustomSizeState();
    updateTravelNote();
    updateEstimate();
  });

  updateCustomSizeState();
  updateTravelNote();
  updateEstimate();
})();
