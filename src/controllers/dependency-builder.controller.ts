import { buildDependencyGraph } from '@/dependency-builder/dependency-builder';
import { NextFunction, Request, Response } from 'express';

class DependencyBuilderController {
  public getDependencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, version } = req.params;
      const dependencyGraph = await buildDependencyGraph(name, version);

      if (!dependencyGraph) {
        res.status(404).json({ error: `Package: ${name}, version: ${version} not found!` });
      }
      res.status(200).json({ data: dependencyGraph });
    } catch (error) {
      next(error);
    }
  };
}

export default DependencyBuilderController;
