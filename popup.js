document.addEventListener('DOMContentLoaded', function() {
    var getTabTitleButton = document.getElementById('getTabTitle');
    var tabTitleDisplay = document.getElementById('tabTitle');
  
    getTabTitleButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        tabTitleDisplay.textContent = currentTab.title;
      });
    });
  });
  