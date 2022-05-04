const { AuthenticationError, UserInputError } = require("apollo-server");

const checkAuth = require("../../util/check-auth");
const Activity = require("../../models/activity");

module.exports = {
  Mutation: {
    createTask: async (
      _,
      { createTaskInput: { activityId, task, startdate, enddate } },
      context
    ) => {
      const { username } = checkAuth(context);
      if (task.trim() === "") {
        throw new UserInputError("Empty Task", {
          errors: {
            task: "Task body must not empty",
          },
        });
      }

      const activity = await Activity.findById(activityId);

      if (activity) {
        activity.tasks.unshift({
          task,
          startdate,
          enddate,
          username,
          createdAt: new Date().toISOString(),
        });
        await activity.save();
        return activity;
      } else throw new UserInputError("Activity not found");
    },
    async deleteTask(_, { activityId, taskId }, context) {
      const { username } = checkAuth(context);

      const activity = await Activity.findById(activityId);

      if (activity) {
        const taskIndex = activity.tasks.findIndex((c) => c.id === taskId);

        if (activity.tasks[taskIndex].username === username) {
          activity.tasks.splice(taskIndex, 1);
          await activity.save();
          return activity;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
