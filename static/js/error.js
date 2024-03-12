document.addEventListener('DOMContentLoaded', function() {

  const targetNode = document.getElementById('dataTable');

  const config = { childList: true, subtree: true };

  const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {

        mutation.addedNodes.forEach(node => {
          if(node.nodeType === 1 && node.tagName === 'TR') {
            node.querySelectorAll('td').forEach(td => {
              
              if(td.textContent.trim().endsWith('.Error')) {
                node.style.backgroundColor = '#e86868';
              }
            });
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

});