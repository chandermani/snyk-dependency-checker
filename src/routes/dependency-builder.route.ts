import { Router } from 'express';
import DependencyBuilderController from '@controllers/dependency-builder.controller';
import Route from '@interfaces/routes.interface';

class DependencyBuilderRoute implements Route {
  public path = '/packages/:name/:version/dependencies';
  public router = Router();
  public dependencyBuilderController = new DependencyBuilderController();
  public pathInstance = (packageName, version) => `/packages/${packageName}/${version}/dependencies`;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.dependencyBuilderController.getDependencies);
  }
}

export default DependencyBuilderRoute;
