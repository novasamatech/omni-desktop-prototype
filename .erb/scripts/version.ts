import { execSync } from 'child_process';

export function getAppVersion(): string {
  const release = execSync(
    'git describe --tags $(git rev-list --tags --max-count=1)',
  );
  const hash = execSync('git rev-parse --short HEAD');
  return `${release}.${hash}`;
}

export default {};
