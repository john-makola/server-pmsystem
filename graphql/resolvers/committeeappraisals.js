const { AuthenticationError, UserInputError } = require("apollo-server");

const CommitteeAppraisal = require("../../models/committeeapraisal");
const SupervisorAppraisal = require("../../models/supervisorappraisal");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getCommitteeAppraisals() {
      try {
        const committeeappraisals = await CommitteeAppraisal.find()
          .populate({
            path: "supervisorappraisal",
            select: "supervisorScore supervisorComment",
            populate: {
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
            },
          })

          .sort({ createdAt: -1 });

        return committeeappraisals;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getCommitteeAppraisal(_, { committeeappraisalId }) {
      try {
        const committeeappraisal = await CommitteeAppraisal.findById(
          committeeappraisalId
        ).populate({
          path: "supervisorappraisal",
          select: "supervisorScore supervisorComment",
          populate: {
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
          },
        });

        if (committeeappraisal) {
          return committeeappraisal;
        } else {
          throw new Error("CommitteeAppraisal not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createCommitteeAppraisal(
      _,
      {
        CreateCommitteeAppraisalInput: {
          supervisorappraisal,
          committeeScore,
          committeecomment,
        },
      },
      context
    ) {
      const user = checkAuth(context);
      if (supervisorappraisal.trim() === "") {
        throw new Error("Supervisor Appraisal must not be empty");
      }
      if (committeeScore === "") {
        throw new Error("Committee Score must not be empty");
      }
      if (committeecomment.trim() === "") {
        throw new Error("SelfScore must not be empty");
      }

      const supervisorAppraisalData = await SupervisorAppraisal.findById(
        supervisorappraisal
      ).populate({
        path: "taskappraisal",
        select: "username achievedResult selfScore usercomment ",
      });

      if (!supervisorAppraisalData) {
        throw new Error("Task Appraisal not Found");
      }

      const newCommitteeAppraisal = new CommitteeAppraisal({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        supervisorappraisal: supervisorAppraisalData,
        committeeScore,
        committeecomment,
      });

      const committeeappraisal = await newCommitteeAppraisal.save();

      context.pubsub.publish("NEW_SUPERVISORSCORE", {
        newCommitteeAppraisal: committeeappraisal,
      });

      return committeeappraisal;
    },

    async deleteCommitteeAppraisal(_, { committeeappraisalId }, context) {
      const user = checkAuth(context);

      try {
        const committeeappraisal = await CommitteeAppraisal.findById(
          committeeappraisalId
        );
        if (user.username === committeeappraisal.username) {
          await committeeappraisal.delete();
          return "CommitteeAppraisal deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newCommitteeAppraisal: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterator("NEW_SUPERVISORSCORE"),
    },
  },
};
