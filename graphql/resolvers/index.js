const postsResolvers = require("./posts");
const usersResolvers = require("./users");
const commentsResolvers = require("./comments");
const departmentResolvers = require("./departments");
const rolesResolvers = require("./roles");
const jobGroupResolvers = require("./jobgroups");
const projectResolvers = require("./projects");
const activityResolvers = require("./activities");
const taskResolvers = require("./tasks");
const targetResolvers = require("./targets");
const trainingResolvers = require("./trainings");
const taskappraisalResolvers = require("./taskappraisals");
const supervisorAppraisalResolvers = require("./supervisorappraisals");
const committeeAppraisalResolvers = require("./committeeappraisals");
const datetime = require("./datetime");
const appraisalreviewMeetingResolvers = require("./appraisalreviewmeeting");

module.exports = {
  DateTime: [datetime],
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postsResolvers.Query,
    ...departmentResolvers.Query,
    ...usersResolvers.Query,
    ...rolesResolvers.Query,
    ...jobGroupResolvers.Query,
    ...projectResolvers.Query,
    ...activityResolvers.Query,
    ...taskResolvers.Query,
    ...targetResolvers.Query,
    ...trainingResolvers.Query,
    ...taskappraisalResolvers.Query,
    ...supervisorAppraisalResolvers.Query,
    ...committeeAppraisalResolvers.Query,
    ...appraisalreviewMeetingResolvers.Query,
  },
  Project: {
    ...projectResolvers.Project,
  },
  Activity: {
    ...activityResolvers.Activity,
  },
  User: {
    ...usersResolvers.User,
  },
  TaskAppraisal: {
    ...taskappraisalResolvers.TaskAppraisal,
  },

  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...departmentResolvers.Mutation,
    ...rolesResolvers.Mutation,
    ...jobGroupResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...activityResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...targetResolvers.Mutation,
    ...trainingResolvers.Mutation,
    ...supervisorAppraisalResolvers.Mutation,
    ...taskappraisalResolvers.Mutation,
    ...committeeAppraisalResolvers.Mutation,
    ...appraisalreviewMeetingResolvers.Mutation,
  },
  Subscription: {
    ...postsResolvers.Subscription,
    ...departmentResolvers.Subscription,
    ...rolesResolvers.Subscription,
    ...jobGroupResolvers.Subscription,
    ...projectResolvers.Subscription,
    ...activityResolvers.Subscription,
  },
};
