const { AuthenticationError, UserInputError } = require("apollo-server");

const Task = require("../../models/task");
const Activity = require("../../models/activity");
const Target = require("../../models/target");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getTargets() {
      try {
        const targets = await Target.find()
          .populate({
            path: "task",
            select: "taskno taskname activity startdate enddate",
            populate: {
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
            },
          })

          .sort({ createdAt: -1 });

        return targets;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getTarget(_, { targetId }) {
      try {
        const target = await Target.findById(targetId).populate({
          path: "task",
          select: "taskno taskname activity startdate enddate",
          populate: {
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
          },
        });

        if (target) {
          return target;
        } else {
          throw new Error("Target not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createTarget(
      _,
      {
        createTargetInput: {
          targetno,
          targetname,
          task,
          agreedPerformance,
          performanceIndicator,
          startdate,
          enddate,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (targetno.trim() === "") {
        throw new Error("Target No must not be empty");
      }
      if (targetname.trim() === "") {
        throw new Error("Target Name must not be empty");
      }
      if (task.trim() === "") {
        throw new Error("Task must not be empty");
      }

      const taskData = await Task.findById(task).populate({
        path: "activity",
        select: "activityno activityname activitydescription  ",
      });

      if (!taskData) {
        throw new Error("Task not Found");
      }

      const newTarget = new Target({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        targetno,
        targetname,
        task: taskData,
        agreedPerformance: agreedPerformance,
        performanceIndicator: performanceIndicator,
        selfScore: 0,
        supervisorScore: 0,
        jointScore: 0,
        startdate,
        enddate,
      });

      let target = await Target.findOne({ targetno });
      if (target) {
        throw new UserInputError("Target No Already Exists", {
          errors: {
            targetno: "Target No Already Exists",
          },
        });
      }
      target = await newTarget.save();

      context.pubsub.publish("NEW_TARGET", {
        newTarget: target,
      });

      return target;
    },

    async deleteTarget(_, { targetId }, context) {
      const user = checkAuth(context);

      try {
        const target = await Target.findById(targetId);
        if (user.username === target.username) {
          await target.delete();
          return "Target deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateTarget(parent, args, context) {
      const user = checkAuth(context);
      const { targetId } = args;
      const {
        targetno,
        targetname,
        task,
        agreedPerformance,
        performanceIndicator,
        startdate,
        enddate,
        selfScore,
        supervisorScore,
        jointScore,
        achievedResult,
      } = args.target;

      try {
        //const department = await Target.findById(args._id);
        if (user.username) {
          const updates = {};

          if (targetno !== undefined) {
            updates.targetno = targetno;
          }
          if (targetname !== undefined) {
            updates.targetname = targetname;
          }
          if (task !== undefined) {
            updates.task = task;
          }
          if (agreedPerformance !== undefined) {
            updates.agreedPerformance = agreedPerformance;
          }
          if (performanceIndicator !== undefined) {
            updates.performanceIndicator = performanceIndicator;
          }
          if (startdate !== undefined) {
            updates.startdate = startdate;
          }
          if (enddate !== undefined) {
            updates.enddate = enddate;
          }
          if (selfScore !== undefined) {
            updates.selfScore = selfScore;
          }
          if (supervisorScore !== undefined) {
            updates.supervisorScore = supervisorScore;
          }
          if (jointScore !== undefined) {
            updates.jointScore = jointScore;
          }
          if (achievedResult !== undefined) {
            updates.achievedResult = achievedResult;
          }

          const target = await Target.findByIdAndUpdate(targetId, updates, {
            new: true,
          });
          return target;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (error) {}
    },
  },

  Subscription: {
    newTarget: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_TARGET"),
    },
  },
};
