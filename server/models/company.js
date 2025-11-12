const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  id: String,
  type: String,
  title: String,
  content: String,
  order: Number,
});

const SettingsSchema = new mongoose.Schema({
  brandColor: { type: String, default: '#3b82f6' },
  logo: String,
  banner: String,
  cultureVideo: String,
  sections: [SectionSchema],
});

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  recruiterEmail: { type: String, required: true },
  settings: SettingsSchema,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

module.exports = mongoose.model('Company', CompanySchema);
