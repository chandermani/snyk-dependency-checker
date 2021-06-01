import axios from 'axios';
import { maxSatisfying } from 'semver';
import { Package } from './package';
import { packageNpmUrl, packageNpmVersionedUrl } from './uri-builder';

type PackageMetadata = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
};

export async function buildDependencyGraph(packageName: string, version: string): Promise<Package> {
  const packageIdentifier = (packageName, version) => `${packageName}-${version}`;
  const dummyRoot: Package = { name: 'dummy', version: '1', dependencies: [] };

  const packageVersionMetaCache: { [key: string]: PackageMetadata } = {};
  const packageProcessingQueue = [{ packageName, version, parent: dummyRoot }];

  const visited: { [key: string]: boolean } = {};
  visited[packageIdentifier(packageName, version)] = true;

  const packageMetadataResponse = await getPackageVersionMetaData({ packageName, version });
  packageVersionMetaCache[packageIdentifier(packageName, version)] = packageMetadataResponse.data;

  while (packageProcessingQueue.length > 0) {
    const packageToProcess = packageProcessingQueue.shift();

    const {
      name,
      version: packageVersion,
      dependencies,
    } = packageVersionMetaCache[packageIdentifier(packageToProcess.packageName, packageToProcess.version)];

    const newPackage: Package = {
      name,
      version: packageVersion,
      dependencies: [],
    };

    packageToProcess.parent.dependencies.push(newPackage);

    for (const dependencyName in dependencies ?? {}) {
      const depedencyMetadata = await getPackageMetadata(dependencyName);
      const dependencyVersion = maxSatisfying(Object.keys(depedencyMetadata.versions), dependencies[dependencyName]).toString();
      packageVersionMetaCache[packageIdentifier(dependencyName, dependencyVersion)] = depedencyMetadata.versions[dependencyVersion];
      if (!visited[packageIdentifier(dependencyName, dependencyVersion)]) {
        visited[packageIdentifier(dependencyName, dependencyVersion)] = true;
        packageProcessingQueue.push({ packageName: dependencyName, version: dependencyVersion, parent: newPackage });
      }
    }
  }

  return dummyRoot.dependencies[0];
}
async function getPackageVersionMetaData(packageToProcess: { packageName: string; version: string }) {
  try {
    return await axios.get<{ name: string; version: string; dependencies: { [key: string]: string } }>(
      packageNpmVersionedUrl(packageToProcess.packageName, packageToProcess.version),
    );
  } catch {
    // todo: Handling exception
  }
}

async function getPackageMetadata(dependencyName) {
  try {
    return await (
      await axios.get<{ name: string; versions: { [key: string]: PackageMetadata } }>(packageNpmUrl(dependencyName))
    ).data;
  } catch {
    // todo: Handling exception
  }
}
