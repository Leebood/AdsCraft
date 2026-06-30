/**
 * Optimization Package Module
 * 
 * 遵循 Principle 5: Package 不绑定具体 AI，使用 capability 而不是 tool
 * 遵循 Principle 4: 每个 action 必须有 status 字段
 * 遵循 Principle 3: 每个 capability 必须声明 required_inputs
 */

// Types
export * from './types';

// Capabilities
export * from './capabilities';

// Packages
export * from './packages';

// Router
export * from './router';
