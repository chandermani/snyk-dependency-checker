export const noDependencyPackages = [
  {
    name: 'lodash',
    version: 'latest',
    result: {
      name: 'lodash',
      version: '4.17.21',
      dependencies: [],
    },
  },
  {
    name: 'yallist',
    version: '4.0.0',
    result: {
      name: 'yallist',
      version: '4.0.0',
      dependencies: [],
    },
  },
];

export const withDependencyPackages = [
  {
    name: 'semver',
    version: '7.3.5',
    result: {
      name: 'semver',
      version: '7.3.5',
      dependencies: [
        {
          name: 'lru-cache',
          version: '6.0.0',
          dependencies: [{ name: 'yallist', version: '4.0.0', dependencies: [] }],
        },
      ],
    },
  },
];

export const withSharedDependencyPackages = [
  {
    name: 'jws',
    version: '4.0.0',
    result: {
      name: 'jws',
      version: '4.0.0',
      dependencies: [
        {
          name: 'jwa',
          version: '2.0.0',
          dependencies: [
            {
              name: 'buffer-equal-constant-time',
              version: '1.0.1',
              dependencies: [],
            },
            {
              name: 'ecdsa-sig-formatter',
              version: '1.0.11',
              dependencies: [],
            },
          ],
        },
        {
          name: 'safe-buffer', // this dependency is shared
          version: '5.2.1',
          dependencies: [],
        },
      ],
    },
  },
];

export const nonExistentPackages = [
  {
    name: 'this-does-not-exist',
    version: '1.0.0',
  },
  {
    name: 'this-too-does-not-exist',
    version: '2.0.0',
  },
];

export const nonExistentVersionPackages = [
  {
    name: 'jws',
    version: '5.0.0',
    result: {},
  },
  {
    name: 'jws',
    version: '6.0.0',
  },
];
