import request from 'supertest';
import App from '@/app';
import DependencyBuilderRoute from '@/routes/dependency-builder.route';
import * as dependencyBuilderFitures from './fixtures/dependency-builder';
import { axiosResponses } from './fixtures/axios-responses';
import axios from 'axios';
import { when } from 'jest-when';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  Object.keys(axiosResponses).forEach(r => {
    when<Promise<unknown>, any[]>(mockedAxios.get).calledWith(r).mockResolvedValue({ data: axiosResponses[r] });
  });
});

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing dependency builder', () => {
  describe('Packages with no dependencies', () => {
    dependencyBuilderFitures.noDependencyPackages.forEach(p => {
      it(`should return empty package depenendencies for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });

  describe('Packages with nested dependencies', () => {
    dependencyBuilderFitures.withDependencyPackages.forEach(p => {
      it(`should return correct package graph for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });

  describe('Packages with nested and shared dependencies', () => {
    dependencyBuilderFitures.withSharedDependencyPackages.forEach(p => {
      it(`should return correct package graph for package [${p.name}] version [${p.version}]`, async () => {
        const route = new DependencyBuilderRoute();
        const app = new App([route]);
        const response = await request(app.getServer()).get(route.pathInstance(p.name, p.version));
        expect(response.body.data).toStrictEqual(p.result);
      });
    });
  });
});
