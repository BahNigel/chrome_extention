document.addEventListener('DOMContentLoaded', function() {
  var collectedData = []; // Array to store extracted profile data
  var extractDataButton = document.getElementById('extractData');
  var reactOnFeedsButton = document.getElementById('reactOnFeeds');
  var statusDisplay = document.getElementById('status');
  var likeCountInput = document.getElementById('likeCount');
  var commentCountInput = document.getElementById('commentCount');


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


  function processProfile(index, action, profiles = null) {
    if (index < profiles.length) {
      const linkedinUrl = profiles[index];
      chrome.tabs.update({ url: linkedinUrl }, async tab => {
        // Wait for the new tab to load
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener); // Remove listener once the tab is loaded
            // Send message to content script to extract profile information
            chrome.tabs.sendMessage(tab.id, action , response => {
              if (chrome.runtime.lastError) {
                console.error('Error extracting profile name:', chrome.runtime.lastError.message);
                statusDisplay.textContent = 'Error extracting profile name.';
              } else {
                alert("response: "+response)
                const profileName = response;
                if (profileName) {
                  // Store the extracted profile data
                  collectedData.push({ url: linkedinUrl, name: profileName });
                } else {
                  console.log('Profile name not found');
                }

                // Move to the next profile
                setTimeout(() => {
                  processProfile(index + 1,  action , profiles); // Recursive call with incremented index
                }, 1000); // Add a delay before moving to the next profile
              }
            });
          }
        });
      });
    } else {
      if(action === 'extractProfileInfo'){
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
  }

  extractDataButton.addEventListener('click', function() {
    fetch('linkedin_profiles.json')
      .then(response => response.json())
      .then(profiles => {
        let index = 0;

        // Start processing profiles with initial index 0
        processProfile(index, { action: 'extractProfileInfo' } , profiles);
        
      })
      .catch(error => {
        console.error('Error reading JSON file:', error);
        statusDisplay.textContent = 'An error occurred while reading the LinkedIn profiles.';
      });
  });



  function toggleButtonState() {
    if (commentCountInput.value && likeCountInput.value) {
        reactOnFeedsButton.removeAttribute('disabled');
    } else {
        reactOnFeedsButton.setAttribute('disabled', 'true');
    }
}

// Add event listeners to input fields
commentCountInput.addEventListener('input', toggleButtonState);
likeCountInput.addEventListener('input', toggleButtonState);

// Initial check to set the initial state of the button
toggleButtonState();

  reactOnFeedsButton.addEventListener('click', function (e) {
    

    fetch('feeds.json')
    .then(response => response.json())
    .then(profiles => {
      let index = 0;

      // Start processing profiles with initial index 0
      processProfile(index, { action: 'addFeeds', commentCountInput: commentCountInput.value, likeCountInput: likeCountInput.value } , profiles);
      
    })
    .catch(error => {
      console.error('Error reading JSON file:', error);
      statusDisplay.textContent = 'An error occurred while reading the LinkedIn profiles.';
    });
});










});
