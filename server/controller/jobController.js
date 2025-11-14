const Job = require('../models/Job');

// Get all jobs (with filters)
exports.getJobs = async (req, res) => {
  const { company, companySlug, location, jobType, search } = req.query;
  const slug = companySlug || company;

  let query = { companySlug: slug }; // Uses whichever is available

  if (location && location !== 'all') query.location = location;
  if (jobType && jobType !== 'all') query.jobType = jobType;
  if (search) query.title = new RegExp(search, 'i');

  try {
    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get available filters
exports.getJobFilters = async (req, res) => {
  try {
    const jobs = await Job.find({ companySlug: req.params.companySlug });
    const locations = [...new Set(jobs.map((j) => j.location))];
    const jobTypes = [...new Set(jobs.map((j) => j.jobType))];
    res.json({ locations, jobTypes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed jobs for a company
exports.seedJobs = async (req, res) => {
  const { companySlug, jobs } = req.body;
  try {
    const inserted = await Job.insertMany(
      jobs.map((job) => ({ ...job, companySlug }))
    );
    res.json({ success: true, count: inserted.length, jobs: inserted });
  } catch (err) {
    console.error('Error seeding jobs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({
      success: true,
      message: 'Job deleted successfully',
      job: deleted,
    });
  } catch (err) {
    console.error('Error in deleteJob:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};