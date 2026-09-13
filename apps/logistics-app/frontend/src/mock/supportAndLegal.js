/**
 * Isolated Mock Support & Legal Policies Dataset
 */

export const mockSupportData = {
  supportHours: '8:00 AM – 10:00 PM',
  supportPhone: '1800-419-MANDI (62634)',
  emergencyNumber: '112',
  activeOrderIssue: {
    orderId: 'MK10284',
    cargo: 'Fresh Tomatoes (120 kg)',
    status: 'In Transit',
  },
  categories: [
    { id: 'cat-delivery', title: 'Delivery', icon: 'local-shipping' },
    { id: 'cat-payment', title: 'Payment', icon: 'payments' },
    { id: 'cat-account', title: 'Account', icon: 'person' },
    { id: 'cat-technical', title: 'Technical', icon: 'build' },
    { id: 'cat-vehicle', title: 'Vehicle', icon: 'directions-car' },
    { id: 'cat-other', title: 'Other', icon: 'more-horiz' },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'How do I accept a delivery?',
      answer: 'When a delivery request appears on your screen or in the Deliveries list, tap "Accept Delivery". You will have immediate access to navigation, contact numbers for the farmer and the buyer, and cargo instructions.',
    },
    {
      id: 'faq-2',
      question: 'How is my delivery earning calculated?',
      answer: 'Earnings are based on base pickup fare (₹75), total transit distance, heavy produce weight allowance, and an AI Smart Route bonus for combined sequences.',
    },
    {
      id: 'faq-3',
      question: 'What if produce is damaged, spoiled, or refused at destination?',
      answer: 'Use the "Report Issue / Bad Delivery" button in the active route or delivery details screen. Select the appropriate reason (Spoiled Goods, Weight Mismatch, Buyer Refused), take clear photos of the produce, and our dispatch desk will adjust or resolve the order within 10 minutes.',
    },
    {
      id: 'faq-4',
      question: 'When are payouts transferred to my bank account?',
      answer: 'MandiKart processes weekly automated payouts every Monday. You can also trigger an instant withdrawal once your balance reaches the minimum threshold of ₹500.',
    },
  ],
  recentTickets: [
    {
      id: 'TICK-10250',
      title: 'Delivery Issue (Traffic Delay)',
      orderId: 'MK10250',
      time: 'Today',
      status: 'IN_REVIEW',
    },
    {
      id: 'TICK-402',
      title: 'Payment Incentive Adjustment',
      orderId: 'Payout #402',
      time: 'Yesterday',
      status: 'RESOLVED',
    },
  ],
};

export const mockLegalPolicies = {
  lastUpdated: '3 September 2026',
  items: [
    {
      id: 'terms',
      icon: 'description',
      title: 'Terms & Conditions',
      desc: 'Rules and conditions for using MandiKart Partner',
      effectiveDate: 'September 3, 2026',
      sections: [
        {
          title: '1. Acceptance of Terms',
          body: 'By registering, accessing, or utilizing the MandiKart Partner App, you agree to comply with and be legally bound by these terms. If you do not accept these terms, you must refrain from using the platform.',
        },
        {
          title: '2. Partner Eligibility & Documentation',
          body: 'Partners must be at least 18 years of age, hold an active Commercial or two-wheeler/four-wheeler driving license, have active motor insurance, and submit verified PAN/Aadhaar details for mandatory KYC verification under standard safety protocols.',
        },
        {
          title: '3. Cargo Handling & Perishable Standards',
          body: 'As an independent logistics partner transporting fresh agricultural commodities, you agree to exercise due care with perishable crates, prevent cargo contamination, and verify weight measurements during farmer handover.',
        },
      ],
    },
    {
      id: 'privacy',
      icon: 'shield',
      title: 'Privacy Policy',
      desc: 'How MandiKart collects, uses and protects your personal and operational data',
      effectiveDate: 'September 3, 2026',
      sections: [
        {
          title: '1. Telemetry and Geolocation',
          body: 'We collect precise location data exclusively during active delivery shifts to calculate optimal AI transit routes, compute fuel compensation, and provide buyer arrival estimates.',
        },
        {
          title: '2. Financial Record Privacy',
          body: 'Bank account numbers, payout histories, and tax identifiers are encrypted under industry-standard AES-256 protocols and accessed solely for direct disbursement.',
        },
      ],
    },
    {
      id: 'partner',
      icon: 'handshake',
      title: 'Partner Agreement',
      desc: 'Terms applicable to delivery partner services and contractor engagement',
      effectiveDate: 'September 3, 2026',
      sections: [
        {
          title: '1. Independent Contractor Relationship',
          body: 'Delivery partners operate as independent service providers with total flexibility in setting operational hours, accepting routes, and taking breaks.',
        },
      ],
    },
    {
      id: 'delivery',
      icon: 'local-shipping',
      title: 'Delivery & Cancellation Policy',
      desc: 'Protocols for accepting, executing, handling exceptions, and cancelling orders',
      effectiveDate: 'September 3, 2026',
      sections: [
        {
          title: '1. Cancellation Standards',
          body: 'Once a delivery has been accepted, cancellation without a verified reason (such as vehicle breakdown or extreme weather) affects your completion metric and daily ranking.',
        },
      ],
    },
    {
      id: 'payment',
      icon: 'account-balance-wallet',
      title: 'Payment & Payout Policy',
      desc: 'Transparent earnings calculations, bonus disbursements, and bank transfers',
      effectiveDate: 'September 3, 2026',
      sections: [
        {
          title: '1. Calculation Transparency',
          body: 'Every fare displays the exact breakdown: Base Fare + Per-Kilometer Distance + Heavy Cargo Allowance + Smart Route Efficiency Bonus.',
        },
      ],
    },
  ],
};

export default {
  mockSupportData,
  mockLegalPolicies,
};
