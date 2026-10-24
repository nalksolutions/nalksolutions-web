// Node 24.22.1 contains the October 21, 2026 security fixes.
const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  throw new Error(
    `Node ${process.versions.node} is unsupported. Use Node >=24.22.1 <25, including on Vercel.`,
  );
}
console.log(`Node ${process.versions.node}: security baseline satisfied.`);
