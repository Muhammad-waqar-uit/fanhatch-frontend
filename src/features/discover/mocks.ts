/** Static mock data for the Discover feature. UI-only — no API. */

import type { DiscoverClub, DiscoverCreator, SparkPoint } from './types'

/** Build a deterministic sparkline that trends toward `changePct`. */
export function spark(base: number, changePct: number, seed: number): SparkPoint[] {
  const points: SparkPoint[] = []
  const drift = (base * changePct) / 100 / 11
  let price = base - drift * 11
  for (let t = 0; t < 12; t += 1) {
    // Small deterministic wobble so lines feel organic without randomness at runtime.
    const wobble = Math.sin((t + seed) * 1.3) * base * 0.015
    points.push({ t, price: Math.max(0.0001, price + wobble) })
    price += drift
  }
  return points
}

export const TRENDING_CLUBS: DiscoverClub[] = [
  {
    id: 'c1',
    name: 'Cobie',
    ticker: 'COBIE',
    clubNo: 12,
    verified: true,
    priceEth: 0.842,
    changePct: 18.4,
    holders: 4820,
    history: spark(0.842, 18.4, 1),
  },
  {
    id: 'c2',
    name: 'Hsaka',
    ticker: 'HSAKA',
    clubNo: 47,
    verified: true,
    priceEth: 0.615,
    changePct: 9.2,
    holders: 3110,
    history: spark(0.615, 9.2, 2),
  },
  {
    id: 'c3',
    name: 'Ansem',
    ticker: 'ANSEM',
    clubNo: 8,
    verified: true,
    priceEth: 1.204,
    changePct: -4.7,
    holders: 6740,
    history: spark(1.204, -4.7, 3),
  },
  {
    id: 'c4',
    name: 'Pentoshi',
    ticker: 'PENT',
    clubNo: 133,
    priceEth: 0.389,
    changePct: 27.1,
    holders: 2190,
    history: spark(0.389, 27.1, 4),
  },
  {
    id: 'c5',
    name: 'GCR',
    ticker: 'GCR',
    clubNo: 3,
    verified: true,
    priceEth: 2.058,
    changePct: 5.6,
    holders: 9020,
    history: spark(2.058, 5.6, 5),
  },
  {
    id: 'c6',
    name: 'Ledger Status',
    ticker: 'LEDGER',
    clubNo: 216,
    priceEth: 0.271,
    changePct: -1.9,
    holders: 1480,
    history: spark(0.271, -1.9, 6),
  },
]

export const SUGGESTED_CREATORS: DiscoverCreator[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    handle: 'alexonchain',
    verified: true,
    bio: 'Trading small caps & sharing alpha daily.',
    followers: 128400,
  },
  {
    id: 'u2',
    name: 'Mira Chen',
    handle: 'miradefi',
    bio: 'DeFi researcher. LP strategies & yield.',
    followers: 54200,
  },
  {
    id: 'u3',
    name: 'Deniz K.',
    handle: 'denizbuilds',
    verified: true,
    bio: 'Building onchain social. ex-founder.',
    followers: 91300,
  },
  {
    id: 'u4',
    name: 'Sofia Marino',
    handle: 'sofia_nft',
    bio: 'NFT curator & community host.',
    followers: 33800,
  },
  {
    id: 'u5',
    name: 'Jordan Blake',
    handle: 'jblake',
    bio: 'Macro takes, memes, and market structure.',
    followers: 76100,
  },
]
