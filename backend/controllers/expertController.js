const Expert = require('../models/Expert');

// GET /experts - with pagination, search, filter
const getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 6, search = '', category = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const [experts, total] = await Promise.all([
      Expert.find(query)
        .select('-availability')
        .sort({ rating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expert.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getExperts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching experts' });
  }
};

// GET /experts/:id
const getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert || !expert.isActive) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Clean up past dates from availability
    const today = new Date().toISOString().split('T')[0];
    expert.availability = expert.availability.filter((a) => a.date >= today);

    res.json({ success: true, data: expert });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expert ID' });
    }
    console.error('getExpertById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expert' });
  }
};

module.exports = { getExperts, getExpertById };
