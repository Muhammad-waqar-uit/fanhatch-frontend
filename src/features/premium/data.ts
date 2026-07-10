/**
 * Static plan + upgrade data for the Premium screen. UI-only: hardcoded to
 * mirror the Fans.tech figma "Select a plan" reference — no API calls.
 */
import type { Plan, UpgradeReason } from './types'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'Forever',
    current: true,
    cta: 'Current',
    features: [
      'Built-in crypto wallet',
      'Basic posting tools',
      'Manual cross-posting',
      'Reads access',
      'Basic trading features',
      '1GB media storage',
      'Standard platform fees',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$250',
    period: 'Per year',
    current: false,
    cta: 'Select Plan',
    features: [
      'Automated cross-posting',
      'Post scheduling',
      'Drafts & templates',
      'Zero trading fees',
      '50GB media storage',
      'Custom profile themes',
      'Early access to new features',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$873',
    period: 'Per year',
    current: false,
    cta: 'Select Plan',
    features: [
      'Fans.tech Studio',
      'Long-form publishing & tipping',
      'Cross-platform Ads Suite',
      'Create & manage paid campaigns',
      'Zero platform fees',
      '150GB media storage',
      'Advanced analytics dashboard',
      'Priority support',
    ],
  },
]

/** Intro paragraphs shown on the left of the "Why Upgrade?" section. */
export const UPGRADE_INTRO: string[] = [
  'Become a power creator and help shape the future. Open protocols give us the opportunity to regain control over our online presence.',
  "At Fans.tech, we don't rely on advertising revenue. We don't monetize your data. Our sole focus is to make the best possible product for our creators.",
  'By signing up for a paid plan, you directly fund independent, creator-owned infrastructure — and help us keep building in the open.',
]

/** Feature blurbs shown on the right of the "Why Upgrade?" section. */
export const UPGRADE_REASONS: UpgradeReason[] = [
  {
    title: 'Automated cross-posting',
    description:
      'Schedule and automatically publish content across all your connected social platforms. Save time with drafts and templates.',
  },
  {
    title: 'Studio & Ads Suite',
    description:
      'Pro members get access to the full Studio for long-form publishing with tipping, plus the complete Ads Suite for creating and managing paid campaigns.',
  },
  {
    title: 'Zero fees & more storage',
    description:
      'Trade with zero fees and store up to 150GB of media. Keep more of what you earn while your best content stays online.',
  },
  {
    title: 'Advanced analytics & priority support',
    description:
      'Track growth with an advanced analytics dashboard and get priority support whenever you need a hand.',
  },
]
