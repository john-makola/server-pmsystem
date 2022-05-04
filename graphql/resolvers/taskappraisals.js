const { AuthenticationError, UserInputError } = require("apollo-server");

const Target = require("../../models/target");
const TaskAppraisal = require("../../models/taskappraisal");
const checkAuth = require("../../util/check-auth");
const SupervisorAppraisal = require("../../models/supervisorappraisal");
const CommitteeAppraisal = require("../../models/committeeapraisal");
module.exports = {
  Query: {
    async getTaskAppraisals() {
      try {
        const taskAppraisals = await TaskAppraisal.find()
          .populate({
            path: "target",
            select:
              "targetno targetname agreeedPerformance performanceIndicator startdate enddate",
            populate: {
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
                    select:
                      "departmentno departmentname departmentdescription  ",
                  },
                },
              },
            },
          })

          .sort({ createdAt: -1 });

        return taskAppraisals;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getTaskAppraisal(_, { taskappraisalId }) {
      try {
        const taskappraisal = await TaskAppraisal.findById(
          taskappraisalId
        ).populate({
          path: "target",
          select:
            "targetno targetname agreeedPerformance performanceIndicator startdate enddate",
          populate: {
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
          },
        });

        if (taskappraisal) {
          return taskappraisal;
        } else {
          throw new Error("TaskAppraisal not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  TaskAppraisal: {
    supervisorappraisal: async (parent, { supervisorappraisalId }, context) => {
      const supervisorId = parent.id;

      const supervisorappraisal = await SupervisorAppraisal.findById(
        supervisorappraisalId
      ).populate({
        path: "taskappraisal",
        select: "achievedResult selfScore usercomment",
        populate: {
          path: "target",
          select: "targetno,targetname, agreedPerformance performanceIndicator",
        },
      });

      return supervisorappraisal;
    },
    // committeeappraisal: async (parent, { committeeappraisalId }, context) => {
    //   const committeeId = parent.id;

    //   const committeeappraisal = await CommitteeAppraisal.findById(
    //     committeeappraisalId
    //   ).populate({
    //     path: "supervisorappraisal",
    //     select: "supervisorScore supervisorcomment",
    //     populate: {
    //       path: "taskappraisal",
    //       select: "achievedResult selfScore usercomment",
    //       populate: {
    //         path: "target",
    //         select:
    //           "targetno,targetname, agreedPerformance performanceIndicator",
    //       },
    //     },
    //   });
    //   console.log(committeeappraisal);
    //   return committeeappraisal;
    // },
  },

  Mutation: {
    async createTaskAppraisal(
      _,
      {
        CreateTaskAppraisalInput: {
          target,
          achievedResult,
          selfScore,
          usercomment,
        },
      },
      context
    ) {
      const user = checkAuth(context);
      if (target.trim() === "") {
        throw new Error("Target must not be empty");
      }
      if (achievedResult.trim() === "") {
        throw new Error("Achieved Result must not be empty");
      }
      if (selfScore === "") {
        throw new Error("SelfScore must not be empty");
      }

      const targetData = await Target.findById(target).populate({
        path: "target",
        select:
          "targetno, targetname agreedPerformmance performanceIndicator startdate enddate createdAt ",
      });

      if (!targetData) {
        throw new Error("Target not Found");
      }

      const newTaskAppraisal = new TaskAppraisal({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        target: targetData,
        achievedResult,
        selfScore,
        usercomment,
      });

      const taskappraisal = await newTaskAppraisal.save();

      context.pubsub.publish("NEW_TASKAPPRAISAL", {
        newTaskAppraisal: taskappraisal,
      });

      return taskappraisal;
    },

    async deleteTaskAppraisal(_, { taskappraisalId }, context) {
      const user = checkAuth(context);

      try {
        const taskappraisal = await TaskAppraisal.findById(taskappraisalId);
        if (user.username === taskappraisal.username) {
          await taskappraisal.delete();
          return "TaskAppraisal deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newTaskAppraisal: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterator("NEW_TASKAPPRAISAL"),
    },
  },
};
