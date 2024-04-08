document.addEventListener('DOMContentLoaded', function() {
  var extractDataButton = document.getElementById('extractData');
  var statusDisplay = document.getElementById('status');
  var collectedData = []; // Array to store extracted profile data

  // Function to save data to the database
  async function saveDataToDatabase(data) {
    try {
      const response = await fetch('http://localhost:3000/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to save data to the database');
      }
      return await response.json();
    } catch (error) {
      console.error('Error saving data to the database:', error.message);
      throw error;
    }
  }

  extractDataButton.addEventListener('click', function() {
    fetch('linkedin_profiles.json')
      .then(response => response.json())
      .then(profiles => {
        let index = 0;

        function processProfile(index) {
          if (index < profiles.length) {
            const linkedinUrl = profiles[index];
            chrome.tabs.update({ url: linkedinUrl }, async tab => {
              // Wait for the new tab to load
              chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                  chrome.tabs.onUpdated.removeListener(listener); // Remove listener once the tab is loaded
                  // Send message to content script to extract profile information
                  chrome.tabs.sendMessage(tab.id, { action: 'extractProfileInfo' }, response => {
                    if (chrome.runtime.lastError) {
                      console.error('Error extracting profile name:', chrome.runtime.lastError.message);
                      statusDisplay.textContent = 'Error extracting profile name.';
                    } else {
                      const profileName = response;
                      if (profileName) {
                        // Store the extracted profile data
                        collectedData.push({ url: linkedinUrl, name: profileName });
                      } else {
                        console.log('Profile name not found');
                      }

                      // Move to the next profile
                      setTimeout(() => {
                        processProfile(index + 1); // Recursive call with incremented index
                      }, 1000); // Add a delay before moving to the next profile
                    }
                  });
                }
              });
            });
          } else {
            // All profiles processed
            console.log('All profiles processed');
            statusDisplay.textContent = 'All profiles processed';
            // Save the collected data to the database
            saveDataToDatabase(collectedData)
              .then(() => {
                console.log('Data saved to the database successfully');
              })
              .catch(error => {
                console.error('Failed to save data to the database:', error.message);
              });
          }
        }
        
        // Start processing profiles with initial index 0
        processProfile(index);
        
      })
      .catch(error => {
        console.error('Error reading JSON file:', error);
        statusDisplay.textContent = 'An error occurred while reading the LinkedIn profiles.';
      });
  });

});
