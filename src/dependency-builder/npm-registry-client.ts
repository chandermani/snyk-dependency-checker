import axios from 'axios';

export const packageNpmVersionedUrl = (name, version) => `https://registry.npmjs.org/${name}/${version}`;
export const packageNpmUrl = name => `https://registry.npmjs.org/${name}`;

export type VersionedPackageMetadata = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
};

export async function getPackageVersionMetaData(packageToProcess: { packageName: string; version: string }) {
  try {
    return await axios.get<{ name: string; version: string; dependencies: { [key: string]: string } }>(
      packageNpmVersionedUrl(packageToProcess.packageName, packageToProcess.version),
    );
  } catch {
    // TODO: Not sure what should be the expected response here. For now we will skip loading details about the package and continue. But this needs discussion.
  }
}

export async function getPackageMetadata(dependencyName) {
  try {
    return await (
      await axios.get<{ name: string; versions: { [key: string]: VersionedPackageMetadata } }>(packageNpmUrl(dependencyName))
    ).data;
  } catch {
    // TODO: Not sure what should be the expected response here. For now we will skip loading details about the package and continue. But this needs discussion.
  }
}
