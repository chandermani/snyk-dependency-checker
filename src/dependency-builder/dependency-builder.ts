import axios from 'axios';
import { maxSatisfying } from 'semver';
import { Package } from './package';
import { packageNpmUrl, packageNpmVersionedUrl } from './uri-builder';

export async function buildDependencyGraph(packageName: string, version: string): Promise<Package> {
  const packageIdentifier = (packageName, version) => `${packageName}-${version}`;
  const dummyRoot: Package = { name: 'dummy', version: '1', dependencies: [] };

  const packageProcessingQueue = [{ packageName, version, parent: dummyRoot }];

  const visited: { [key: string]: boolean } = {};
  visited[packageIdentifier(packageName, version)] = true;

  while (packageProcessingQueue.length > 0) {
    const packageToProcess = packageProcessingQueue.shift();

    const packageMetadataRequest = await getDependencyMetaData(packageToProcess);

    const { name, dependencies, version: packageVersion } = packageMetadataRequest.data;

    const newPackage: Package = {
      name,
      version: packageVersion,
      dependencies: [],
    };

    packageToProcess.parent.dependencies.push(newPackage);

    for (const dependencyName in dependencies ?? {}) {
      const dependencyVersion = await getNormalizeVersion(dependencyName, dependencies[dependencyName]);
      if (!visited[packageIdentifier(dependencyName, dependencyVersion)]) {
        visited[packageIdentifier(dependencyName, dependencyVersion)] = true;
        packageProcessingQueue.push({ packageName: dependencyName, version: dependencyVersion, parent: newPackage });
      }
    }
  }

  return dummyRoot.dependencies[0];
}
async function getDependencyMetaData(packageToProcess: { packageName: string; version: string; parent: Package }) {
  try {
    return await axios.get<{ name: string; version: string; dependencies: { [key: string]: string } }>(
      packageNpmVersionedUrl(packageToProcess.packageName, packageToProcess.version),
    );
  } catch {
    // todo: Handling exception
  }
}

async function getNormalizeVersion(dependencyName, dependencyVersion): Promise<string> {
  try {
    const response = await axios.get<{ versions: { [key: string]: unknown } }>(packageNpmUrl(dependencyName));
    return maxSatisfying(Object.keys(response.data.versions), dependencyVersion).toString();
  } catch {
    // todo: Handling exception
  }
}
