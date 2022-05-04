const { AuthenticationError, UserInputError } = require("apollo-server");

const Activity = require("../../models/activity");
const Task = require("../../models/task");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getTasks(_, { departmentId }) {
      try {
        let filteredTasks = await Task.find()

          .populate({
            path: "activity",
            select: "activityno activityname activitydescription activity",
            populate: {
              path: "project",
              select: "projectno projectname projectdescription  ",
              populate: {
                path: "department",
                select: "departmentno departmentname departmentdescription  ",
              },
            },
          })

          .sort({ createdAt: -1 });
        if (departmentId) {
          filteredTasks = filteredTasks.filter((task) => {
            return task.activity.project.department.id === departmentId;
          });
        }
        return filteredTasks;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getTask(_, { taskId }) {
      try {
        const task = await Task.findById(taskId).populate({
          path: "activity",
          select:
            "activityno activityname activitydescription activity createdAt",
          populate: {
            path: "project",
            select: "projectno projectname projectdescription  ",
            populate: {
              path: "department",
              select: "departmentno departmentname departmentdescription  ",
            },
          },
        });

        if (task) {
          return task;
        } else {
          throw new Error("Task not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createTask(
      _,
      { createTaskInput: { taskno, taskname, activity, startdate, enddate } },
      context
    ) {
      const user = checkAuth(context);

      if (taskno.trim() === "") {
        throw new Error("Task No must not be empty");
      }
      if (taskname.trim() === "") {
        throw new Error("Task Name must not be empty");
      }
      if (activity.trim() === "") {
        throw new Error("Activity must not be empty");
      }
      if (startdate.trim() === "") {
        throw new Error("Start-Date must not be empty");
      }
      if (enddate.trim() === "") {
        throw new Error("End-Date must not be empty");
      }

      const activityData = await Activity.findById(activity).populate({
        path: "activity",
        select: "activityno activityname activitydescription  ",
      });

      if (!activityData) {
        throw new Error("Activity not Found");
      }

      const newTask = new Task({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        taskno,
        taskname,
        activity: activityData,
        startdate,
        enddate,
      });

      let task = await Task.findOne({ taskname });
      if (task) {
        throw new UserInputError("Task No Already Exists", {
          errors: {
            taskname: "Task Name Already Exists",
          },
        });
      }
      task = await newTask.save();

      context.pubsub.publish("NEW_TASK", {
        newTask: task,
      });

      return task;
    },

    async deleteTask(_, { taskId }, context) {
      const user = checkAuth(context);

      try {
        const task = await Task.findById(taskId);
        if (user.username === task.username) {
          await task.delete();
          return "Task deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newTask: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_TASK"),
    },
  },
};
