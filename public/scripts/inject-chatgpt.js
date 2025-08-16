let bigMessageSent = false;
let elementCount = 0;
let timer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
    afterDOMLoaded();
}

function afterDOMLoaded() {

    var callback = function(mutationsList, observer) {
        console.log('callback fired');
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) { // Iterate over all added nodes
                    // Check if the added node matches the general structure you're looking for
                    if (node.matches && node.matches('.w-full.text-token-text-primary') && node.querySelector('[data-message-author-role="assistant"]')) {
                        if (elementCount === 0) {
                            elementCount = document.querySelectorAll('.prose').length;
                        } else if (document.querySelectorAll('.prose').length > elementCount) {
                            timer = setTimeout(checkResponse, 6000);
                        }
                    }
                }
            }
        }
    };
asdasd

    // Create an instance of MutationObserver with the callback
    var observer = new MutationObserver(callback);
    var config = {
        childList: true,
        subtree: true
    };
    var container = document.querySelector('[role="presentation"]');
    if (container) {
        observer.observe(container, config);
    } else {
        console.error("Container element not found for observing message changes.");
    }
}

function checkResponse() {
    const elements = document.querySelectorAll('.prose');
    console.log('here', document)
    const lastElement = elements[elements.length - 1];
    console.log(lastElement)
    const response = lastElement.innerText;
    console.log(response);
    let parts = response.split('$+');
    // Remove the command from the response
    let gptResponse = parts.length ? parts[0] : response;
    // Extract the command
    let command = parts.length > 0 ? parts[1]?.split("\n\n[END]")[0] : "";
    if (response.endsWith('[END]')) {
        clearTimeout(timer);
        chrome.runtime.sendMessage({
            action: JSON.stringify({
                first: "gpt-response",
                second: gptResponse.split("\n\n[END]")[0],
                full: gptResponse,
            })
        });
        bigMessageSent = false;
        // execute command
        if (command?.substring(0, 1) === "!") {
            var parseMessage = command.split("!")[1];
            var command1 = parseMessage;
            var command2 = null;
            var command3 = parseMessage;
            if (command1.includes(" ")) {
                command1 = parseMessage.split(" ")[0];
                command2 = parseMessage.substring(command1.length + 1);
                command3 = parseMessage;
            }
            chrome.runtime.sendMessage({
                action: JSON.stringify({
                    first: command1,
                    second: command2,
                    full: command3
                })
            });
        }
    } else {
        if (bigMessageSent === false) {
            chrome.runtime.sendMessage({
                action: JSON.stringify({
                    first: "$+discord-message",
                    second: "Hmmm. Let me think about that...",
                    full: gptResponse
                })
            });
            bigMessageSent = true;
        }
        timer = setTimeout(checkResponse, 2000);
    }
}