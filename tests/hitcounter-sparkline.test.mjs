import test from 'node:test';
import assert from 'node:assert/strict';
import { sparklinePath, sparklineDescription } from '../src/scripts/hit-counter-sparkline.ts';
const monthly = counts => counts.map((count, i) => ({month: `2026-${String(i + 1).padStart(2, '0')}`, count}));

test('monthly values are chronological, non-cumulative and use a zero baseline', () => {
  const points = monthly([0, 10, 5]);
  assert.equal(sparklinePath(points.toReversed()), 'M2.00,78.00 C76.00,78.00 76.00,2.00 150.00,2.00 C224.00,2.00 224.00,40.00 298.00,40.00');
  assert.deepEqual(points.map(p => p.count), [0, 10, 5]);
});

test('sparse activity keeps real zeroes while unknown and missing months break the line', () => {
  assert.equal(sparklinePath(monthly([4, 0, null, 2, 4])), 'M2.00,2.00 C39.00,2.00 39.00,78.00 76.00,78.00 M224.00,40.00 C261.00,40.00 261.00,2.00 298.00,2.00');
  assert.equal(sparklinePath([{month:'2026-01',count:2},{month:'2026-03',count:4}]), 'M2.00,40.00 M298.00,2.00');
  assert.match(sparklineDescription(monthly([0, null])), /2026-01: 0; 2026-02: unknown/);
});

test('empty, unknown, zero and single-value series are finite and safe', () => {
  assert.equal(sparklinePath([]), '');
  assert.equal(sparklinePath(monthly([null, null])), '');
  assert.equal(sparklinePath(monthly([0, 0, 0])), 'M2.00,78.00 C76.00,78.00 76.00,78.00 150.00,78.00 C224.00,78.00 224.00,78.00 298.00,78.00');
  // An isolated point has no connecting segment and no dot.
  assert.equal(sparklinePath(monthly([7])), 'M150.00,2.00');
  assert.equal(sparklinePath(monthly([0])), 'M150.00,78.00');
  assert.match(sparklineDescription([]), /no monthly data/);
});
