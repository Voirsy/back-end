const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const salonSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  type: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
  ],
  contact: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  imageUrl: {
    type: String,
    required: false,
  },
  portfolio: [
    {
      type: String,
      required: false,
    },
  ],
  city: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "City",
  },
  description: {
    type: String,
    required: false,
  },
  openingHours: [
    {
      name: {
        type: String,
        required: true,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
    },
  ],
  popularity: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  ratings: {
    type: [
      {
        customer: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        opinion: {
          type: String,
          required: false,
          default: "",
        },
        date: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
  services: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
      },
    ],
    default: [],
  },
  crew: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
          required: false,
          default: "",
        },
        schedule: [
          {
            customer: {
              type: Schema.Types.ObjectId,
              required: true,
              ref: "User",
            },
            service: {
              type: Schema.Types.ObjectId,
              required: true,
            },
            start: {
              type: String,
              required: true,
            },
            end: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Salon", salonSchema);
