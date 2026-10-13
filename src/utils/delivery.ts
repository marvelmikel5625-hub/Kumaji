/**
 * Nigerian logistics and delivery calculator for Kumaji
 * Configures realistic dispatch zones, delivery estimates, and fees in integer kobo.
 */

export interface NigerianStateDelivery {
  name: string;
  code: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  standardFeeKobo: number;
  expressAvailable: boolean;
  expressFeeKobo?: number;
}

export const NIGERIAN_STATES: NigerianStateDelivery[] = [
  {
    name: 'Lagos',
    code: 'LA',
    deliveryDaysMin: 1,
    deliveryDaysMax: 2,
    standardFeeKobo: 150000, // ₦1,500
    expressAvailable: true,
    expressFeeKobo: 300000, // ₦3,000 (Same day / next morning)
  },
  {
    name: 'Abuja (FCT)',
    code: 'FC',
    deliveryDaysMin: 2,
    deliveryDaysMax: 3,
    standardFeeKobo: 250000, // ₦2,500
    expressAvailable: true,
    expressFeeKobo: 450000,
  },
  {
    name: 'Rivers (Port Harcourt)',
    code: 'RI',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 280000, // ₦2,800
    expressAvailable: true,
    expressFeeKobo: 500000,
  },
  {
    name: 'Oyo (Ibadan)',
    code: 'OY',
    deliveryDaysMin: 1,
    deliveryDaysMax: 3,
    standardFeeKobo: 200000, // ₦2,000
    expressAvailable: true,
  },
  {
    name: 'Ogun',
    code: 'OG',
    deliveryDaysMin: 1,
    deliveryDaysMax: 3,
    standardFeeKobo: 180000, // ₦1,800
    expressAvailable: true,
  },
  {
    name: 'Kano',
    code: 'KN',
    deliveryDaysMin: 3,
    deliveryDaysMax: 5,
    standardFeeKobo: 350000, // ₦3,500
    expressAvailable: false,
  },
  {
    name: 'Enugu',
    code: 'EN',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 300000, // ₦3,000
    expressAvailable: false,
  },
  {
    name: 'Delta',
    code: 'DE',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 300000, // ₦3,000
    expressAvailable: false,
  },
  {
    name: 'Kaduna',
    code: 'KD',
    deliveryDaysMin: 3,
    deliveryDaysMax: 5,
    standardFeeKobo: 350000, // ₦3,500
    expressAvailable: false,
  },
  {
    name: 'Anambra',
    code: 'AN',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 300000, // ₦3,000
    expressAvailable: false,
  },
  {
    name: 'Edo (Benin City)',
    code: 'ED',
    deliveryDaysMin: 2,
    deliveryDaysMax: 3,
    standardFeeKobo: 250000, // ₦2,500
    expressAvailable: false,
  },
  {
    name: 'Cross River (Calabar)',
    code: 'CR',
    deliveryDaysMin: 3,
    deliveryDaysMax: 5,
    standardFeeKobo: 350000, // ₦3,500
    expressAvailable: false,
  },
  {
    name: 'Plateau (Jos)',
    code: 'PL',
    deliveryDaysMin: 3,
    deliveryDaysMax: 5,
    standardFeeKobo: 350000, // ₦3,500
    expressAvailable: false,
  },
  {
    name: 'Kwara (Ilorin)',
    code: 'KW',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 250000, // ₦2,500
    expressAvailable: false,
  },
  {
    name: 'Akwa Ibom (Uyo)',
    code: 'AK',
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
    standardFeeKobo: 300000, // ₦3,000
    expressAvailable: false,
  },
];

export function getDeliveryQuote(stateName: string, isExpress = false): {
  daysEstimate: string;
  feeKobo: number;
} {
  const state = NIGERIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.name.toLowerCase())
  ) || NIGERIAN_STATES[0];

  if (isExpress && state.expressAvailable && state.expressFeeKobo) {
    return {
      daysEstimate: `${state.deliveryDaysMin} day (Express)`,
      feeKobo: state.expressFeeKobo,
    };
  }

  return {
    daysEstimate: `${state.deliveryDaysMin}–${state.deliveryDaysMax} business days`,
    feeKobo: state.standardFeeKobo,
  };
}
