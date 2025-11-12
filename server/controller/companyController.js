const Company = require('../models/company');
const slugify = require('slugify');

// Get a company by slug
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update company settings
exports.updateCompany = async (req, res) => {
  try {
    const updated = await Company.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Company not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Publish company
exports.publishCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { slug: req.params.slug },
      { published: true, publishedAt: new Date() },
      { new: true }
    );
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or login company (pseudo-auth)
exports.loginRecruiter = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Invalid credentials' });

  try {
    let company = await Company.findOne({ recruiterEmail: email });

    if (!company) {
      const slug = slugify(name || email.split('@')[0], { lower: true, strict: true });
      company = new Company({
        name: name || 'My Company',
        slug,
        recruiterEmail: email,
        settings: {
          brandColor: '#3b82f6',
          logo: '',
          banner: '',
          cultureVideo: '',
          sections: [
            { id: '1', type: 'about', title: 'About Us', content: 'Tell your story...', order: 0 },
            { id: '2', type: 'culture', title: 'Life at Company', content: 'Describe your culture...', order: 1 },
          ],
        },
      });
      await company.save();
    }

    res.json({ success: true, token: 'mock-jwt', company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
