// popup.js
document.addEventListener('DOMContentLoaded', function() {
    var extractDataButton = document.getElementById('extractData');
    var statusDisplay = document.getElementById('status');
    var currentIndex = 0;
  
    extractDataButton.addEventListener('click', function() {
      fetch('linkedin_profiles.json')
        .then(response => response.json())
        .then(profiles => {
          function processProfile() {
            if (currentIndex < profiles.length) {
              const linkedinUrl = profiles[currentIndex];
              chrome.tabs.update({ url: linkedinUrl }, async tab => {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for page to load (adjust time as needed)
  
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: extractData
                }, result => {
                  if (chrome.runtime.lastError || !result || !result[0] || result[0].result === undefined) {
                    // Error occurred during data extraction
                    console.error('Error extracting data from:', linkedinUrl);
                    statusDisplay.textContent = 'Error extracting data from: ' + linkedinUrl;
                  } else {
                    // Data extraction successful, send data to backend
                    const profileData = result[0].result;
                    sendDataToBackend(profileData);
                  }
                  // Move to the next profile
                  currentIndex++;
                  processProfile();
                });
              });
            } else {
              // All profiles processed
              console.log('All profiles processed');
              statusDisplay.textContent = 'All profiles processed';
            }
          }
  
          processProfile();
        })
        .catch(error => {
          console.error('Error reading JSON file:', error);
          statusDisplay.textContent = 'An error occurred while reading the LinkedIn profiles.';
        });
    });
  
    function extractData() {
      // Modify this function to extract required data from the LinkedIn profile page
      // Example: 
      const profileData = {
        name: document.querySelector('.profile-name').textContent,
        headline: document.querySelector('.headline').textContent,
        // Add more fields as needed
      };
  
      return profileData;
    }
  
    function sendDataToBackend(profileData) {
      // Send extracted data to the background script
      chrome.runtime.sendMessage({ action: 'storeData', data: profileData });
    }
  });
  