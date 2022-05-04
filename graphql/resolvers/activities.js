const {
  AuthenticationError,
  UserInputError,
  FilterToSchema,
  FilterRootFields,
} = require("apollo-server");

const Activity = require("../../models/activity");
const Task = require("../../models/task");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    getActivities: async (_, { departmentId }) => {
      try {
        let filteredActivities = await Activity.find()
          .populate({
            path: "project",
            select: "projectno projectname projectdescription department",
            populate: {
              path: "department",
              select: "departmentno departmentname departmentdescription  ",
            },
          })

          .sort({ createdAt: -1 });
        if (departmentId) {
          filteredActivities = filteredActivities.filter((activity) => {
            return activity.project.department.id === departmentId;
          });
        }

        return filteredActivities;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getActivity(_, { activityId }) {
      try {
        const activity = await Activity.findById(activityId).populate({
          path: "project",
          select: "projectno projectname projectdescription department",
          populate: {
            path: "department",
            select: "departmentno departmentname departmentdescription  ",
          },
        });
        if (activity) {
          return activity;
        } else {
          throw new Error("Activity not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Activity: {
    tasks: async (parent, args, context) => {
      const activityId = parent.id;
      const tasks = await Task.find({ activity: activityId });
      return tasks;
    },
  },
  Mutation: {
    async createActivity(
      _,
      {
        createActivityInput: {
          activityno,
          activityname,
          activitydescription,
          project,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (activityno.trim() === "") {
        throw new Error("Activity No must not be empty");
      }
      if (activityname.trim() === "") {
        throw new Error("Activity Name must not be empty");
      }
      if (activitydescription.trim() === "") {
        throw new Error("Activity Description must not be empty");
      }
      if (project.trim() === "") {
        throw new Error("Project must not be empty");
      }

      const projectData = await Project.findById(project).populate({
        path: "project",
        select: "projectno projectname projectdescription  ",
      });

      if (!projectData) {
        throw new Error("Project not Found");
      }

      const newActivity = new Activity({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        activityno,
        activityname,
        activitydescription,
        project: projectData,
      });

      let activity = await Activity.findOne({ activityno });
      if (activity) {
        throw new UserInputError("Activity No Already Exists", {
          errors: {
            activityname: "Activity Name Already Exists",
          },
        });
      }
      activity = await newActivity.save();

      context.pubsub.publish("NEW_ACTIVITY", {
        newActivity: activity,
      });

      return activity;
    },

    async deleteActivity(_, { activityId }, context) {
      const user = checkAuth(context);

      try {
        const activity = await Activity.findById(activityId);
        if (user.username === activity.username) {
          await activity.delete();
          return "Activity deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newActivity: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_ACTIVITY"),
    },
  },
};
