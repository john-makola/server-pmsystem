const { AuthenticationError, UserInputError } = require("apollo-server");

const SupervisorAppraisal = require("../../models/supervisorappraisal");
const TaskAppraisal = require("../../models/taskappraisal");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getSupervisorAppraisals() {
      try {
        const supervisorappraisals = await SupervisorAppraisal.find()
          .populate({
            path: "taskappraisal",
            select: "username achievedResult selfScore usercomment",
            populate: {
              path: "target",
              select:
                "targetno targetname agreeedPerformance performanceIndicator startdate enddate",
              populate: {
                path: "task",
                select: "taskno taskname activity startdate enddate",
                populate: {
                  path: "activity",
                  select:
                    "activityno activityname activitydescription activity",
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
            },
          })

          .sort({ createdAt: -1 });

        return supervisorappraisals;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getSupervisorAppraisal(_, { supervisorappraisalId }) {
      try {
        const supervisorappraisal = await SupervisorAppraisal.findById(
          supervisorappraisalId
        ).populate({
          path: "taskappraisal",
          select: "achievedResult selfScore usercomment",
          populate: {
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
          },
        });

        if (supervisorappraisal) {
          return supervisorappraisal;
        } else {
          throw new Error("SupervisorAppraisal not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createSupervisorAppraisal(
      _,
      {
        CreateSupervisorAppraisalInput: {
          taskappraisal,
          supervisorScore,
          supervisorcomment,
        },
      },
      context
    ) {
      const user = checkAuth(context);
      if (taskappraisal.trim() === "") {
        throw new Error("Task to be Appraised must not be empty");
      }
      if (supervisorScore === "") {
        throw new Error("Supervisor Score must not be empty");
      }
      if (supervisorcomment.trim() === "") {
        throw new Error("SelfScore must not be empty");
      }

      const taskAppraisalData = await TaskAppraisal.findById(
        taskappraisal
      ).populate({
        path: "target",
        select:
          "targetno, targetname agreedPerformmance performanceIndicator startdate enddate createdAt ",
      });

      if (!taskAppraisalData) {
        throw new Error("Task Appraisal not Found");
      }

      const newSupervisorAppraisal = new SupervisorAppraisal({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        taskappraisal: taskAppraisalData,
        supervisorScore,
        supervisorcomment,
      });

      const supervisorappraisal = await newSupervisorAppraisal.save();

      context.pubsub.publish("NEW_SUPERVISORSCORE", {
        newSupervisorAppraisal: supervisorappraisal,
      });

      return supervisorappraisal;
    },

    async deleteSupervisorAppraisal(_, { supervisorappraisalId }, context) {
      const user = checkAuth(context);

      try {
        const supervisorappraisal = await SupervisorAppraisal.findById(
          supervisorappraisalId
        );
        if (user.username === supervisorappraisal.username) {
          await supervisorappraisal.delete();
          return "SupervisorAppraisal deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newSupervisorAppraisal: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterator("NEW_SUPERVISORSCORE"),
    },
  },
};
