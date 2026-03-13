import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  ownerName: {
    type: String,
    default: "Workspace Owner",
  },
  description: {
    type: String,
    default: "",
  },
  prompt: {
    type: String,
    required: true,
  },
  files: [fileSchema],
  thumbnail: {
    type: String,
    default: "",
  },
  previewUrl: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Project = mongoose.model("Project", projectSchema);
