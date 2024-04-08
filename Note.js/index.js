const express = require('express');
const bodyParser = require('body-parser');
const { Company, Profile } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Enable CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specified HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  next();
});

// Handle preflighted requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// API to send 2 unverified companies
app.get('/unverified-companies', async (req, res) => {
    try {
      let companies = [];
  
      // Retrieve unverified company records whose status is false
      const unverifiedCompanies = await Company.findAll({
        where: { verified: true, status: false }, // Add condition for status
        attributes: ['id', 'email'],
        order: [['createdAt', 'ASC']] // Order by creation date
      });
  
      // Loop through unverified companies until you find two with status true or until the end
      for (const company of unverifiedCompanies) {
        if (companies.length === 2 || company.status === true) {
          break;
        }
        // Set status to true for the retrieved record
        company.status = true;
        await company.save();
        companies.push(company);
      }
  
      // If there's only one unverified company with status false, push it to the companies array
      if (companies.length === 0 && unverifiedCompanies.length === 1) {
        const singleCompany = unverifiedCompanies[0];
        singleCompany.status = true;
        await singleCompany.save();
        companies.push(singleCompany);
      }
  
      // Send the retrieved records as a response
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// API to mark company email as verified
app.put('/verify-company/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    company.verified = true;
    await company.save();
    res.json({ message: 'Company email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to create a new company record
app.post('/companies', async (req, res) => {
    console.log(req.body);
  const { name, country, website, email } = req.body;
  try {
    const company = await Company.create({ name, country, website, email, verified: false });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to create a new profile record
app.post('/profiles', async (req, res) => {
  try {
    const profilesData = req.body; // Assuming req.body contains an array of profile objects
    const profiles = [];

    for (const profileData of profilesData) {
      const { url, name } = profileData;

      // Extracting profile data
      const { name: profileName, location, about, bio, connections, followers } = name;

      // Create or update the profile in the database
      const profile = await Profile.create({
        url,
        name: profileName,
        location,
        about,
        bio,
        connections,
        followers
      });
      
      profiles.push(profile);
    }

    res.status(201).json(profiles);
  } catch (error) {
    console.error('Error saving profiles to the database:', error.message);
    res.status(500).json({ error: 'Failed to save profiles to the database' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
