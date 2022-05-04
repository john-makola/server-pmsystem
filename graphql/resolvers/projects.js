const { AuthenticationError, UserInputError } = require("apollo-server");

const Project = require("../../models/project");
const Activity = require("../../models/activity");
const Department = require("../../models/department");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getProjects(_, { departmentId }) {
      try {
        let filteredProjects = await Project.find()

          .populate({
            path: "department",
            select: " departmentno departmentname departmentdescription  ",
          })
          .sort({ createdAt: -1 });
        if (departmentId) {
          filteredProjects = filteredProjects.filter((project) => {
            return project.department.id === departmentId;
          });
        }
        return filteredProjects;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getProject(_, { projectId }) {
      try {
        const project = await Project.findById(projectId).populate({
          path: "department",
          select: "departmentno departmentname departmentdescription  ",
        });
        if (project) {
          return project;
        } else {
          throw new Error("Project not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Project: {
    activities: async (parent, args, context) => {
      const projectId = parent.id;
      const activities = await Activity.find({ project: projectId });
      return activities;
    },
  },

  Mutation: {
    async createProject(
      _,
      {
        createProjectInput: {
          projectno,
          projectname,
          projectdescription,
          department,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (projectno.trim() === "") {
        throw new Error("ProjectNo must not be empty");
      }
      if (projectname.trim() === "") {
        throw new Error("Project Name must not be empty");
      }
      if (projectdescription.trim() === "") {
        throw new Error("Project Description must not be empty");
      }
      if (department.trim() === "") {
        throw new Error("Department must not be empty");
      }

      const dept = await Department.findById(department).populate({
        path: "department",
        select: "departmentno departmentname departmentdescription  ",
      });

      if (!dept) {
        throw new Error("Department not Found");
      }

      const newProject = new Project({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        projectno,
        projectname,
        projectdescription,
        department: dept,
      });

      let project = await Project.findOne({ projectno });
      if (project) {
        throw new UserInputError("ProjectNo Already Exists", {
          errors: {
            projectname: "ProjectNo Already Exists",
          },
        });
      }
      project = await newProject.save();

      context.pubsub.publish("NEW_PROJECT", {
        newProject: project,
      });

      return project;
    },

    async deleteProject(_, { projectId }, context) {
      const user = checkAuth(context);

      try {
        const project = await Project.findById(projectId);
        if (user.username === project.username) {
          await project.delete();
          return "Project deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newProject: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_PROJECT"),
    },
  },
};
