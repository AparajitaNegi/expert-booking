require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

const generateSlots = (daysAhead = 14) => {
  const availability = [];
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      availability.push({
        date: date.toISOString().split('T')[0],
        slots: times.map((time) => ({ time, isBooked: false, bookingId: null })),
      });
    }
  }
  return availability;
};

const experts = [
  // TECHNOLOGY
  { name: 'Dr. Arjun Mehta', category: 'Technology', bio: 'Full-stack architect with 12+ years building scalable systems at Google and Flipkart. Specializes in cloud infrastructure and microservices design.', experience: 12, rating: 4.9, reviewCount: 248, hourlyRate: 150, avatar: 'AM', skills: ['React', 'Node.js', 'AWS', 'Kubernetes', 'System Design'] },
  { name: 'Siddharth Rao', category: 'Technology', bio: 'Ex-Microsoft engineer and AI/ML specialist with 9 years of experience. Built recommendation engines serving 100M+ users at Amazon.', experience: 9, rating: 4.8, reviewCount: 193, hourlyRate: 170, avatar: 'SR', skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Engineering', 'LLMs'] },
  { name: 'Neha Joshi', category: 'Technology', bio: 'Mobile architect who has shipped 20+ apps with 50M+ combined downloads. Former lead engineer at Swiggy and Zomato.', experience: 8, rating: 4.7, reviewCount: 156, hourlyRate: 130, avatar: 'NJ', skills: ['React Native', 'iOS', 'Android', 'Flutter', 'Firebase'] },
  { name: 'Kiran Bhat', category: 'Technology', bio: 'Cybersecurity expert and ethical hacker with 14 years protecting Fortune 500 companies. CISSP certified with expertise in penetration testing.', experience: 14, rating: 4.8, reviewCount: 211, hourlyRate: 190, avatar: 'KB', skills: ['Penetration Testing', 'Security Audits', 'CISSP', 'DevSecOps', 'Cloud Security'] },

  // BUSINESS
  { name: 'Rahul Sharma', category: 'Business', bio: 'Serial entrepreneur and business strategist who founded 3 successful startups, 2 of which were acquired. Mentors early-stage founders on GTM and fundraising.', experience: 15, rating: 4.7, reviewCount: 312, hourlyRate: 200, avatar: 'RS', skills: ['Startup Strategy', 'Fundraising', 'GTM', 'Product-Market Fit', 'Pitch Decks'] },
  { name: 'Meera Pillai', category: 'Business', bio: 'McKinsey-trained consultant with 11 years advising C-suite executives across FMCG and retail. Specializes in organizational transformation and market entry strategy.', experience: 11, rating: 4.8, reviewCount: 267, hourlyRate: 250, avatar: 'MP', skills: ['Management Consulting', 'Market Entry', 'OKRs', 'P&L Management', 'M&A'] },
  { name: 'Aditya Khanna', category: 'Business', bio: 'Operations expert who scaled 4 D2C brands from zero to $10M ARR. Former COO at two YC-backed startups with deep supply chain expertise.', experience: 10, rating: 4.6, reviewCount: 189, hourlyRate: 180, avatar: 'AK', skills: ['Operations', 'Supply Chain', 'D2C Strategy', 'Unit Economics', 'Scaling'] },
  { name: 'Sunita Verma', category: 'Business', bio: 'Executive coach and leadership development specialist with 16 years training senior leaders at TATA and Infosys. ICF-certified coach with 500+ client hours.', experience: 16, rating: 4.9, reviewCount: 334, hourlyRate: 220, avatar: 'SV', skills: ['Executive Coaching', 'Leadership', 'Team Building', 'Change Management', 'Strategy'] },

  // DESIGN
  { name: 'Priya Krishnan', category: 'Design', bio: 'Senior UX/UI designer who led design systems at Airbnb and Razorpay. Expert in user research, Figma, and design thinking for fintech products.', experience: 8, rating: 4.8, reviewCount: 183, hourlyRate: 120, avatar: 'PK', skills: ['UX Research', 'Figma', 'Design Systems', 'Prototyping', 'Accessibility'] },
  { name: 'Rohan Desai', category: 'Design', bio: 'Brand identity designer who has built visual identities for 80+ startups and 3 unicorns. Former creative director at Ogilvy Mumbai with Cannes Lions recognition.', experience: 12, rating: 4.7, reviewCount: 221, hourlyRate: 140, avatar: 'RD', skills: ['Brand Identity', 'Logo Design', 'Typography', 'Illustration', 'Motion Design'] },
  { name: 'Aisha Fernandez', category: 'Design', bio: 'Product designer specializing in zero-to-one product creation for B2B SaaS. Has designed 15+ products from scratch that raised Series A funding.', experience: 7, rating: 4.6, reviewCount: 148, hourlyRate: 110, avatar: 'AF', skills: ['Product Design', 'Wireframing', 'User Testing', 'SaaS UX', 'Design Sprints'] },
  { name: 'Tanvi Shah', category: 'Design', bio: '3D and immersive experience designer with expertise in AR/VR interfaces. Built spatial computing experiences for Apple Vision Pro and Meta Quest platforms.', experience: 6, rating: 4.5, reviewCount: 112, hourlyRate: 130, avatar: 'TS', skills: ['3D Design', 'AR/VR', 'Blender', 'Spatial UX', 'Unity'] },

  // MARKETING
  { name: 'Kavya Nair', category: 'Marketing', bio: 'Digital marketing strategist who helped 50+ startups achieve 10x growth through performance marketing. Former VP Growth at CRED and PhonePe.', experience: 9, rating: 4.6, reviewCount: 201, hourlyRate: 110, avatar: 'KN', skills: ['SEO', 'Content Marketing', 'Performance Marketing', 'Brand Strategy', 'Analytics'] },
  { name: 'Aryan Gupta', category: 'Marketing', bio: 'Growth hacker and community builder who grew a SaaS product from 0 to 200K users in 18 months purely through organic channels and product-led growth.', experience: 7, rating: 4.7, reviewCount: 178, hourlyRate: 120, avatar: 'AG', skills: ['Growth Hacking', 'Product-Led Growth', 'Community Building', 'Viral Loops', 'Retention'] },
  { name: 'Divya Menon', category: 'Marketing', bio: 'Content strategist and thought leadership expert who built personal brands for 30+ CEOs and founders. Former head of content at YourStory Media.', experience: 10, rating: 4.5, reviewCount: 165, hourlyRate: 95, avatar: 'DM', skills: ['Content Strategy', 'Thought Leadership', 'LinkedIn', 'Storytelling', 'PR'] },
  { name: 'Rishi Kapoor', category: 'Marketing', bio: 'Paid advertising specialist managing $5M+ monthly ad spend across Google, Meta, and programmatic. Certified Google Partner with expertise in e-commerce scaling.', experience: 8, rating: 4.8, reviewCount: 234, hourlyRate: 130, avatar: 'RK', skills: ['Google Ads', 'Meta Ads', 'Programmatic', 'CRO', 'E-commerce Marketing'] },

  // FINANCE
  { name: 'Vikram Patel', category: 'Finance', bio: 'CFA charterholder with deep expertise in venture capital and startup valuation. Ex-Goldman Sachs analyst who has evaluated 300+ investment opportunities.', experience: 11, rating: 4.8, reviewCount: 156, hourlyRate: 180, avatar: 'VP', skills: ['Financial Modeling', 'VC Funding', 'Valuation', 'M&A', 'Due Diligence'] },
  { name: 'Pooja Agarwal', category: 'Finance', bio: 'CFO turned advisor who has taken 2 companies through successful IPOs on NSE. Specializes in fundraising strategy, investor relations, and financial planning.', experience: 14, rating: 4.9, reviewCount: 289, hourlyRate: 230, avatar: 'PA', skills: ['IPO Preparation', 'Investor Relations', 'FP&A', 'Cap Table Management', 'Board Reporting'] },
  { name: 'Nikhil Bose', category: 'Finance', bio: 'Tax strategist and chartered accountant with 13 years helping startups optimize their tax structure. Saved clients over ₹50Cr in taxes through legal structuring.', experience: 13, rating: 4.7, reviewCount: 198, hourlyRate: 160, avatar: 'NB', skills: ['Tax Planning', 'GST', 'International Taxation', 'Startup Compliance', 'Transfer Pricing'] },
  { name: 'Sneha Reddy', category: 'Finance', bio: 'Personal finance coach and SEBI-registered investment advisor who has helped 1000+ individuals build wealth through mutual funds and equity investing.', experience: 8, rating: 4.6, reviewCount: 312, hourlyRate: 90, avatar: 'SR', skills: ['Personal Finance', 'Mutual Funds', 'Equity Research', 'Portfolio Management', 'Retirement Planning'] },

  // HEALTH
  { name: 'Ananya Iyer', category: 'Health', bio: 'Licensed therapist and wellness coach specializing in workplace burnout and leadership resilience. Has coached 500+ executives at Google, Deloitte, and Wipro.', experience: 10, rating: 4.9, reviewCount: 290, hourlyRate: 130, avatar: 'AI', skills: ['CBT', 'Burnout Recovery', 'Leadership Coaching', 'Mindfulness', 'Performance'] },
  { name: 'Dr. Sameer Kulkarni', category: 'Health', bio: 'Sports medicine physician and performance optimization specialist. Has worked with Indian Olympic athletes and 3 IPL cricket teams to maximize physical performance.', experience: 12, rating: 4.8, reviewCount: 176, hourlyRate: 150, avatar: 'SK', skills: ['Sports Medicine', 'Injury Rehabilitation', 'Performance Optimization', 'Nutrition', 'Biomechanics'] },
  { name: 'Preethi Nair', category: 'Health', bio: 'Functional nutrition expert and certified dietitian who has reversed Type 2 diabetes in 200+ clients through lifestyle and dietary interventions. Former researcher at AIIMS.', experience: 9, rating: 4.7, reviewCount: 243, hourlyRate: 110, avatar: 'PN', skills: ['Clinical Nutrition', 'Diabetes Management', 'Weight Loss', 'Gut Health', 'Functional Medicine'] },
  { name: 'Rahul Oberoi', category: 'Health', bio: 'Sleep scientist and circadian health coach who has helped 800+ high-performing professionals optimize sleep for peak productivity. Published researcher with 15 peer-reviewed papers.', experience: 11, rating: 4.6, reviewCount: 189, hourlyRate: 120, avatar: 'RO', skills: ['Sleep Optimization', 'Circadian Rhythm', 'Stress Management', 'Biohacking', 'HRV Training'] },

  // LEGAL
  { name: 'Suresh Venkat', category: 'Legal', bio: 'Corporate attorney specializing in startup law and IP protection. Former partner at AZB & Partners who has structured 100+ venture transactions worth $500M+.', experience: 14, rating: 4.7, reviewCount: 178, hourlyRate: 220, avatar: 'SV', skills: ['Startup Law', 'IP Protection', 'Term Sheets', 'ESOP', 'Contracts'] },
  { name: 'Aditi Bhatt', category: 'Legal', bio: 'Employment law specialist and HR compliance expert with 10 years helping startups build legally sound people practices. Prevents costly litigation before it happens.', experience: 10, rating: 4.8, reviewCount: 145, hourlyRate: 190, avatar: 'AB', skills: ['Employment Law', 'HR Compliance', 'POSH', 'Labour Laws', 'Policy Drafting'] },
  { name: 'Manish Tiwari', category: 'Legal', bio: 'Data privacy and technology law expert. Helped 60+ companies achieve GDPR and DPDP Act compliance. Former legal counsel at Nasscom.', experience: 9, rating: 4.6, reviewCount: 132, hourlyRate: 200, avatar: 'MT', skills: ['Data Privacy', 'GDPR', 'DPDP Act', 'Tech Contracts', 'Regulatory Compliance'] },
  { name: 'Kavitha Sundaram', category: 'Legal', bio: 'M&A and cross-border transaction lawyer who has closed deals in 12 countries. Specializes in helping Indian startups expand internationally and set up foreign subsidiaries.', experience: 13, rating: 4.9, reviewCount: 167, hourlyRate: 250, avatar: 'KS', skills: ['M&A', 'Cross-border Transactions', 'Foreign Subsidiary', 'Due Diligence', 'International Law'] },

  // EDUCATION
  { name: 'Deepika Rao', category: 'Education', bio: 'EdTech innovator and curriculum designer who built online learning programs serving 500K+ students across 40 countries. Former head of curriculum at BYJU\'S.', experience: 7, rating: 4.5, reviewCount: 134, hourlyRate: 90, avatar: 'DR', skills: ['Curriculum Design', 'EdTech', 'E-Learning', 'Instructional Design', 'LMS'] },
  { name: 'Vivek Chandrasekhar', category: 'Education', bio: 'IIT-IIM alumnus and GMAT/GRE coach who has helped 2000+ students get into top global universities with scholarships worth $10M+ collectively.', experience: 11, rating: 4.9, reviewCount: 456, hourlyRate: 100, avatar: 'VC', skills: ['GMAT Coaching', 'GRE Prep', 'College Admissions', 'SOP Writing', 'Interview Prep'] },
  { name: 'Nandita Ghosh', category: 'Education', bio: 'K-12 education reform specialist and teacher trainer who has trained 5000+ teachers across government schools in 8 states. TEDx speaker on reimagining classroom learning.', experience: 13, rating: 4.7, reviewCount: 198, hourlyRate: 80, avatar: 'NG', skills: ['Teacher Training', 'K-12 Education', 'Pedagogy', 'Educational Psychology', 'STEM Education'] },
  { name: 'Saurabh Mathur', category: 'Education', bio: 'Corporate learning and development expert who designs leadership programs for MNCs. Has trained 10,000+ professionals at Accenture, TCS, and HCL in the last 8 years.', experience: 8, rating: 4.6, reviewCount: 223, hourlyRate: 110, avatar: 'SM', skills: ['L&D', 'Leadership Training', 'Workshop Facilitation', 'E-Learning Design', 'Soft Skills'] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await Expert.deleteMany({});
    console.log('🗑  Cleared existing experts');
    const expertsWithSlots = experts.map(e => ({ ...e, isActive: true, availability: generateSlots() }));
    const inserted = await Expert.insertMany(expertsWithSlots);
    console.log(`🎉 Seeded ${inserted.length} experts successfully (4 per category)!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();