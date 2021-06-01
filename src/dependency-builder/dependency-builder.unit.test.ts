import request from 'supertest';
import App from '@/app';
import DependencyBuilderRoute from '@/routes/dependency-builder.route';
import * as dependencyBuilderFixtures from './fixtures/dependency-builder';
import { axiosNotFoundResponses, axiosResponses } from './fixtures/axios-responses';

import mockedAxios from 'axios';
import { when } from 'jest-when';

beforeAll(() => {
  Object.keys(axiosResponses).forEach(r => {
    when<Promise<unknown>, any[]>(<any>mockedAxios.get)
      .calledWith(r)
      .mockResolvedValue({ data: axiosResponses[r] });
  });

  Object.keys(axiosNotFoundResponses).forEach(r => {
    when<Promise<unknown>, any[]>(<any>mockedAxios.get)
      .calledWith(r)
      .mockResolvedValue(undefined);
  });
});

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing dependency builder', () => {
  describe('Packages with no dependencies', () => {
    dependencyBuilderFixtures.noDependencyPackages.forEach(p => {
      it(`should return empty package dependencies for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });

  describe('Packages with nested dependencies', () => {
    dependencyBuilderFixtures.withDependencyPackages.forEach(p => {
      it(`should return correct package graph for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });

  describe('Packages with nested and shared dependencies', () => {
    dependencyBuilderFixtures.withSharedDependencyPackages.forEach(p => {
      it(`should return correct package graph for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });

  describe('Package not found', () => {
    dependencyBuilderFixtures.nonExistentPackages.forEach(p => {
      it(`should return 404 for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.status).toBe(404);
      });
    });
  });

  describe('Package version not found', () => {
    dependencyBuilderFixtures.nonExistentVersionPackages.forEach(p => {
      it(`should return 404 for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.status).toBe(404);
      });
    });
  });
});
