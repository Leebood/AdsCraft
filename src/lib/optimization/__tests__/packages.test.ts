import { describe, it, expect } from 'vitest';
import { 
  getIssuePackage, 
  getAllCoreIssuePackages,
  CTR_LOW_PACKAGE,
  FREQUENCY_HIGH_PACKAGE,
  COST_PER_RESULT_HIGH_PACKAGE,
  ROAS_LOW_PACKAGE,
  SPEND_TOO_LOW_PACKAGE,
  NO_RESULTS_PACKAGE
} from '../packages';
import { 
  validateCapabilityInputs, 
  getCapability,
  CAPABILITIES 
} from '../capabilities';
import { 
  getServiceRouter, 
  isCapabilityAvailable, 
  routeCapability 
} from '../router';
import type { CapabilityId } from '../types';

describe('Optimization Package', () => {
  describe('6 Core Issues Coverage', () => {
    it('should have CTR_LOW issue', () => {
      const pkg = getIssuePackage('CTR_LOW');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('CTR_LOW');
      expect(pkg?.severity).toBe('High');
    });

    it('should have FREQUENCY_HIGH issue', () => {
      const pkg = getIssuePackage('FREQUENCY_HIGH');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('FREQUENCY_HIGH');
      expect(pkg?.severity).toBe('Medium');
    });

    it('should have COST_PER_RESULT_HIGH issue', () => {
      const pkg = getIssuePackage('COST_PER_RESULT_HIGH');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('COST_PER_RESULT_HIGH');
      expect(pkg?.severity).toBe('High');
    });

    it('should have ROAS_LOW issue', () => {
      const pkg = getIssuePackage('ROAS_LOW');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('ROAS_LOW');
      expect(pkg?.severity).toBe('High');
    });

    it('should have SPEND_TOO_LOW issue', () => {
      const pkg = getIssuePackage('SPEND_TOO_LOW');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('SPEND_TOO_LOW');
      expect(pkg?.severity).toBe('Medium');
    });

    it('should have NO_RESULTS issue', () => {
      const pkg = getIssuePackage('NO_RESULTS');
      expect(pkg).toBeDefined();
      expect(pkg?.issue_id).toBe('NO_RESULTS');
      expect(pkg?.severity).toBe('High');
    });

    it('should have exactly 6 core issues', () => {
      const allIssues = getAllCoreIssuePackages();
      expect(allIssues).toHaveLength(6);
    });
  });

  describe('CTR_LOW Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = CTR_LOW_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('headline_generation');
      expect(capabilities).toContain('copy_generation');
      expect(capabilities).toContain('cta_generation');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = CTR_LOW_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('audience_targeting');
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('bid_strategy');
    });
  });

  describe('FREQUENCY_HIGH Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = FREQUENCY_HIGH_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('creative_generation');
      expect(capabilities).toContain('creative_rotation');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = FREQUENCY_HIGH_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('audience_expansion');
    });
  });

  describe('COST_PER_RESULT_HIGH Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = COST_PER_RESULT_HIGH_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('offer_optimization');
      expect(capabilities).toContain('copy_optimization');
      expect(capabilities).toContain('landing_page_checklist');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = COST_PER_RESULT_HIGH_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('bid_strategy_modification');
    });
  });

  describe('ROAS_LOW Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = ROAS_LOW_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('value_proposition_optimization');
      expect(capabilities).toContain('priority_optimization');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = ROAS_LOW_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('budget_increase');
    });
  });

  describe('SPEND_TOO_LOW Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = SPEND_TOO_LOW_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('budget_increase_suggestion');
      expect(capabilities).toContain('campaign_expansion');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = SPEND_TOO_LOW_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('audience_narrowing');
    });
  });

  describe('NO_RESULTS Package', () => {
    it('should have correct recommended capabilities', () => {
      const pkg = NO_RESULTS_PACKAGE;
      const capabilities = pkg.recommended_actions.map(a => a.capability);
      expect(capabilities).toContain('offer_review');
      expect(capabilities).toContain('landing_page_review');
      expect(capabilities).toContain('tracking_check');
    });

    it('should have correct forbidden capabilities', () => {
      const pkg = NO_RESULTS_PACKAGE;
      expect(pkg.recommended_actions[0].forbidden_actions).toContain('creative_change');
    });
  });

  describe('Capability Definitions', () => {
    it('should have all 15 capabilities defined', () => {
      expect(Object.keys(CAPABILITIES)).toHaveLength(15);
    });

    it('should have required_inputs for each capability', () => {
      Object.values(CAPABILITIES).forEach(cap => {
        expect(cap.required_inputs).toBeDefined();
        expect(Array.isArray(cap.required_inputs)).toBe(true);
      });
    });

    it('should have correct required_inputs for headline_generation', () => {
      const cap = getCapability('headline_generation');
      expect(cap?.required_inputs).toBeDefined();
      const inputNames = cap?.required_inputs.map(i => i.name) || [];
      expect(inputNames).toContain('product_name');
      expect(inputNames).toContain('value_proposition');
    });

    it('should have correct required_inputs for copy_generation', () => {
      const cap = getCapability('copy_generation');
      expect(cap?.required_inputs).toBeDefined();
      const inputNames = cap?.required_inputs.map(i => i.name) || [];
      expect(inputNames).toContain('product_name');
      expect(inputNames).toContain('target_audience');
      expect(inputNames).toContain('value_proposition');
    });
  });

  describe('Required Inputs Validation', () => {
    it('should pass when all required inputs are provided', () => {
      const result = validateCapabilityInputs('headline_generation', {
        product_name: 'Test Product',
        value_proposition: 'Best product ever'
      });
      expect(result.valid).toBe(true);
      expect(result.missingInputs).toHaveLength(0);
    });

    it('should fail when required inputs are missing', () => {
      const result = validateCapabilityInputs('headline_generation', {
        product_name: 'Test Product'
      });
      expect(result.valid).toBe(false);
      expect(result.missingInputs).toContain('value_proposition');
    });

    it('should fail when no inputs are provided', () => {
      const result = validateCapabilityInputs('headline_generation', {});
      expect(result.valid).toBe(false);
      expect(result.missingInputs).toHaveLength(2);
    });
  });

  describe('Capability Router', () => {
    it('should return service router for valid capability', () => {
      const router = getServiceRouter('headline_generation');
      expect(router).toBeDefined();
      expect(router).not.toBeNull();
      // V1 阶段服务都是禁用的
      expect(router?.enabled).toBe(false);
    });

    it('should return null for invalid capability', () => {
      const router = getServiceRouter('invalid_capability' as CapabilityId);
      expect(router).toBeNull();
    });

    it('should check capability availability (V1 all disabled)', () => {
      // V1 阶段所有服务都是禁用的
      expect(isCapabilityAvailable('headline_generation')).toBe(false);
      expect(isCapabilityAvailable('invalid_capability' as CapabilityId)).toBe(false);
    });

    it('should route capability to service (V1 placeholder)', async () => {
      const result = await routeCapability('headline_generation', {
        product_name: 'Test',
        value_proposition: 'Best'
      });
      expect(result).toBeDefined();
      // V1 阶段返回占位信息
      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });
  });

  describe('Principle Compliance', () => {
    it('Principle 3: Each capability must declare required_inputs', () => {
      Object.values(CAPABILITIES).forEach(cap => {
        expect(cap.required_inputs).toBeDefined();
        expect(Array.isArray(cap.required_inputs)).toBe(true);
      });
    });

    it('Principle 4: Each action must have status field', () => {
      const allIssues = getAllCoreIssuePackages();
      allIssues.forEach(issue => {
        issue.recommended_actions.forEach(action => {
          expect(action.status).toBeDefined();
          expect(['pending', 'completed']).toContain(action.status);
        });
      });
    });

    it('Principle 5: Package uses capability, not tool', () => {
      const allIssues = getAllCoreIssuePackages();
      allIssues.forEach(issue => {
        issue.recommended_actions.forEach(action => {
          expect(action.capability).toBeDefined();
          expect(typeof action.capability).toBe('string');
        });
      });
    });
  });
});
