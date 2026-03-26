/**
 * ws shim.
 * tsworld bundles a dynamic import("ws") for Node.js,
 * but in browsers ENVIRONMENT_IS_NODE is false so it is never executed.
 * This file exists only to satisfy the bundler's module resolution.
 */
export default null;
