// content_script.js

// Listen for messages from the popup script
// content_script.js

// content_script.js

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extractProfileInfo') {
    // Perform the logic to extract profile information here

    // Extract profile name
    var profileNameLink = document.querySelector('a[href$="/about-this-profile/"]');
    var profileName = profileNameLink ? profileNameLink.closest('a').querySelector('h1').textContent.trim() : 'Name not found';

    // Extract location
    var locationSpan = document.querySelector('span.text-body-small.inline.t-black--light.break-words');
    var location = locationSpan ? locationSpan.textContent.trim() : 'Location not found';

    // Extract about
    var aboutDiv = document.querySelector('div.pv-shared-text-with-see-more.full-width.t-14.t-normal.t-black.display-flex.align-items-center');
    var aboutText = aboutDiv ? aboutDiv.textContent.trim() : 'About not found';

    // Extract bio
    var bioDiv = document.querySelector('div.text-body-medium.break-words');
    var bio = bioDiv ? bioDiv.textContent.trim() : 'Bio not found';

    // Extract connection count
    var connectionCountSpan = document.querySelector('a[href="/mynetwork/invite-connect/connections/"] span.t-bold');
    var connectionCount = connectionCountSpan ? connectionCountSpan.textContent.trim() : 'Connection count not found';

    // Extract follower count
    var followerCountSpan = document.querySelector('div.pvs-header__title-container p.pvs-header__optional-link.text-body-small span');
    var followerCount = followerCountSpan ? followerCountSpan.textContent.trim() : 'Follower count not found';

    // Construct the profile object with extracted information
    var profileInfo = {
      name: profileName,
      location: location,
      about: aboutText,
      bio: bio,
      connections: connectionCount,
      followers: followerCount
    };

    sendResponse(profileInfo); // Send the extracted profile information back to the background script
  }else{
    if (request.action === 'addFeeds') {
      // Code to react to feeds (like and comment)
      // Simulate liking on LinkedIn feed
      var commentCountInput = request.commentCountInput
      var likeCountInput = request.likeCountInput
      console.log(commentCountInput)
      console.log(likeCountInput)
      alert(commentCountInput+' '+ likeCountInput)
      document.querySelectorAll('button.react-button__trigger').forEach(function(button, index) {
        if (index < likeCountInput) {
          button.click(); // Simulate clicking the like button
        }
      });
  
      // Simulate commenting on LinkedIn feed
      document.querySelectorAll('button.comment-button').forEach(function(button, index) {
        if (index < commentCountInput) {
          // Find the corresponding textarea and set the comment text
          var textarea = button.closest('.comments-comment-box__form-container').querySelector('textarea.commentable-textarea');
          if (textarea) {
            textarea.value = "CFBR"; // Set the comment text
            button.click(); // Simulate clicking the comment button
          }
        }
      });
  
      // Send a response indicating that feeds have been processed
      sendResponse('Feeds processed successfully');
    }
  
  }
});


