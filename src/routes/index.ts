import CommentRoutes from "../components/comments/comments_route";
import RoleRoutes from "../components/roles/roles_route";
import TaskRoutes from "../components/tasks/tasks_route";
import UserRoutes from "../components/users/users_route";
import { Express, Router } from "express";
import ProjectRoutes from "../components/projects/projects_route";

class Routes {
  public router: Router;

  constructor(app: Express) {
    const routeClasses = [CommentRoutes, RoleRoutes, ProjectRoutes, TaskRoutes, UserRoutes];

    for (const routeClass of routeClasses) {
      try {
        new routeClass(app);
        console.log(`Router: ${routeClass.name} - Connected`.gray.underline);
      } catch (error) {
        console.error(`Unable to connect ${routeClass.name}`.cyan.underline);
      }
    }
  };
};

export default Routes;