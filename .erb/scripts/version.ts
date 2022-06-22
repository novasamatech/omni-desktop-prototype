import { execSync } from 'child_process';

export function getAppVersion(): string {
  const release = execSync('git describe --tags --abbrev=0');
  const hash = execSync('git rev-parse --short HEAD');
  return `${release}.${hash}`;
}

export default {};
