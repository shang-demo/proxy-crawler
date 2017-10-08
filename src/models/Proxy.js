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

    ipNextCheckTime: {
      type: Date,
    },
    country: {
      type: String,
    },
    country_id: {
      type: String,
    },
    area: {
      type: String,
    },
    area_id: {
      type: String,
    },
    region: {
      type: String,
    },
    region_id: {
      type: String,
    },
    city: {
      type: String,
    },
    city_id: {
      type: String,
    },
    county: {
      type: String,
    },
    county_id: {
      type: String,
    },
    isp: {
      type: String,
    },
    isp_id: {
      type: String,
    },
  },
};
