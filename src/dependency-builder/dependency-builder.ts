import { maxSatisfying } from 'semver';
import * as npmClient from './npm-registry-client';
import { Package } from './package';

// TODO: Add method description
export async function buildDependencyGraph(packageName: string, version: string): Promise<Package> {
  const packageIdentifier = (packageName, version) => `${packageName}-${version}`;
  const dummyRoot: Package = { name: 'dummy', version: '1', dependencies: [] };

  const versionedPackageMetaCache: { [key: string]: npmClient.VersionedPackageMetadata } = {};
  const packageProcessingQueue = [{ packageName, version, parent: dummyRoot }];

  const visited: { [key: string]: boolean } = {};
  visited[packageIdentifier(packageName, version)] = true;

  const versionedPackageMetadataResponse = await npmClient.getPackageVersionMetaData({ packageName, version });

  if (!versionedPackageMetadataResponse) {
    return null;
  }

  versionedPackageMetaCache[packageIdentifier(packageName, version)] = versionedPackageMetadataResponse.data;

  while (packageProcessingQueue.length > 0) {
    const packageToProcess = packageProcessingQueue.shift();

    const {
      name,
      version: packageVersion,
      dependencies,
    } = versionedPackageMetaCache[packageIdentifier(packageToProcess.packageName, packageToProcess.version)];

    const newPackage: Package = {
      name,
      version: packageVersion,
      dependencies: [],
    };

    packageToProcess.parent.dependencies.push(newPackage);

    for (const dependencyName in dependencies ?? {}) {
      // get dependency package metadata containing all versions detail
      const dependencyMetadata = await npmClient.getPackageMetadata(dependencyName);
      if (!dependencyMetadata) {
        continue;
      }

      // Determine the version to use based on versions available and dependency version string
      const dependencyVersion = maxSatisfying(Object.keys(dependencyMetadata.versions), dependencies[dependencyName]).toString();
      const packageVersionIdentifier = packageIdentifier(dependencyName, dependencyVersion);

      // Cache version specific package metadata for future use
      versionedPackageMetaCache[packageVersionIdentifier] =
        versionedPackageMetaCache[packageVersionIdentifier] ?? dependencyMetadata.versions[dependencyVersion];

      // If the dependency has not been process add it to the queue
      if (!visited[packageVersionIdentifier]) {
        visited[packageVersionIdentifier] = true;
        packageProcessingQueue.push({ packageName: dependencyName, version: dependencyVersion, parent: newPackage });
      }
    }
  }

  return dummyRoot.dependencies[0];
}
