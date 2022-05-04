const { AuthenticationError, UserInputError } = require("apollo-server");
const AppraisalreviewMeeting = require("../../models/appraisalreviewmeeting");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getAppraisalreviewMeetings() {
      try {
        const appraisalreviewmeetings =
          await AppraisalreviewMeeting.find().sort({ createdAt: -1 });

        return appraisalreviewmeetings;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getAppraisalreviewMeeting(_, { appraisalreviewmeetingId }) {
      try {
        const appraisalreviewmeeting = await AppraisalreviewMeeting.findById(
          appraisalreviewmeetingId
        );
        if (appraisalreviewmeeting) {
          return appraisalreviewmeeting;
        } else {
          throw new Error("Appraisal Review Meeting not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createAppraisalreviewMeeting(
      _,
      {
        CreateAppraisalreviewMeetingInput: {
          meetingno,
          meetingtitle,
          meetingdate,
          memberspresent,
          meetingnotes,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (meetingno.trim() === "") {
        throw new Error("Meeting No must not be empty");
      }
      if (meetingtitle.trim() === "") {
        throw new Error("Meeting Title must not be empty");
      }
      if (meetingdate.trim() === "") {
        throw new Error("Meeting Date must not be empty");
      }

      if (memberspresent.trim() === "") {
        throw new Error("Members Present must not be empty");
      }
      if (meetingnotes.trim() === "") {
        throw new Error("Meeting Notesmust not be empty");
      }

      if (!user.role === "admin") {
        throw new Error(
          "User must be an Admin to Create a AppraisalreviewMeeting"
        );
      }

      const newAppraisalreviewMeeting = new AppraisalreviewMeeting({
        meetingno,
        meetingtitle,
        meetingdate,
        memberspresent,
        meetingnotes,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const appraisalreviewmeeting = await newAppraisalreviewMeeting.save();

      context.pubsub.publish("NEW_APPRAISALREVIEWMEETING", {
        newAppraisalreviewMeeting: appraisalreviewmeeting,
      });

      return appraisalreviewmeeting;
    },

    async deleteAppraisalreviewMeeting(
      _,
      { appraisalreviewmeetingId },
      context
    ) {
      const user = checkAuth(context);

      try {
        const appraisalreviewmeeting = await AppraisalreviewMeeting.findById(
          appraisalreviewmeetingId
        );
        if (user.username === appraisalreviewmeeting.username) {
          await appraisalreviewmeeting.delete();
          return "AppraisalreviewMeeting deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    appraisalreviewmeetingId: {
      subscribe: (_, __, { pubsub }) =>
        pubsub.asyncIterator("NEW_APPRAISAL_REVIEW_MEETING"),
    },
  },
};
