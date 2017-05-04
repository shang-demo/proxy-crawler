
module.exports = {
  attributes: {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    connected: {
      type: Boolean,
      required: true,
    },
    checkIndex: {
      type: Number,
    },
    nextCheckTime: {
      type: Date,
    },
    failedTimes: {
      type: Number,
    },
    deleted: {
      type: Boolean,
    },
    type: {
      type: String,
    },
  },
};
