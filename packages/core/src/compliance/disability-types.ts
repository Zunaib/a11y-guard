import type { DisabilityType } from '../types.js';

export const DISABILITY_TYPE_CRITERIA: Record<DisabilityType, string[]> = {
  visual: [
    '1.1.1', '1.4.1', '1.4.3', '1.4.4', '1.4.5', '1.4.6', '1.4.8', '1.4.9',
    '1.4.10', '1.4.11', '1.4.12', '2.4.11', '2.5.8',
  ],
  auditory: [
    '1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5', '1.2.6', '1.2.7', '1.2.8', '1.2.9',
    '1.4.2',
  ],
  motor: [
    '2.1.1', '2.1.2', '2.1.3', '2.1.4',
    '2.4.1', '2.4.3', '2.4.7', '2.4.11', '2.4.12',
    '2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.5.7', '2.5.8',
  ],
  cognitive: [
    '1.3.1', '1.3.5',
    '2.2.1', '2.2.2',
    '2.4.2', '2.4.4', '2.4.6', '2.4.9',
    '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5',
    '3.2.1', '3.2.2', '3.2.3', '3.2.4',
    '3.3.1', '3.3.2', '3.3.3', '3.3.4',
  ],
  seizure: [
    '2.3.1', '2.3.2', '2.3.3',
  ],
  speech: [
    '1.1.1',
  ],
  language: [
    '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6',
  ],
};

export function getCriteriaForDisabilityType(type: DisabilityType): string[] {
  return DISABILITY_TYPE_CRITERIA[type] ?? [];
}

export function getDisabilityTypesForCriterion(criterionId: string): DisabilityType[] {
  return (Object.entries(DISABILITY_TYPE_CRITERIA) as [DisabilityType, string[]][])
    .filter(([, criteria]) => criteria.includes(criterionId))
    .map(([type]) => type);
}
