// main variables
const TOKEN = "ODE3NjI3MzYxOTk0MjExMzQ4.YEUZvA.cAPgk7Yk_bResOaUD0EXjjAZVHE";
const CHANNEL_ID = "818736522218963005";
const USERNAME = "TV";

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
    afterDOMLoaded();
}

function afterDOMLoaded() {
    // Function to handle new messages
    // MutationObserver callback function
    var callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches('[class*="messageListItem"]')) {
                        let messageContent = node.querySelector('[class^="markup_"][class*="messageContent"]');
                        console.log('messageContent', messageContent)
                        if (messageContent) {
                            let span = messageContent.querySelector('span');
                            let anchor = messageContent.querySelector('a');
                            if (span && !anchor) {
                                let text = span.textContent || span.innerText;
                                debounceHandleNewMessage(text); // This should log !test or whatever the content of the span is
                            } else if (span && anchor) {
                                let text = span.textContent || span.innerText;
                                let url = anchor.href;
                                debounceHandleNewMessage(text + url); // This should log !test or whatever the content of the span is
                            }
                        }
                    }
                }
            }
        }
    };

    var lastInvocationTime = 0;
    const debounceDelay = 1000; // 1 second

    function debounceHandleNewMessage(messageText) {
        const currentTime = new Date().getTime();
        if (currentTime - lastInvocationTime > debounceDelay) {
            lastInvocationTime = currentTime;
            handleNewMessage(messageText);
        }
    }


    function handleNewMessage(messageText) {
        if (messageText.startsWith("!")) {
            let parseMessage = messageText.slice(1); // Removes "!" from the beginning
            let splitMessage = parseMessage.split(" ");
            let command1 = splitMessage[0];
            let command2 = splitMessage.length > 1 ? splitMessage.slice(1).join(" ") : null;
            let command3 = parseMessage;
    
            chrome.runtime.sendMessage({
                action: JSON.stringify({
                    first: command1,
                    second: command2,
                    full: command3
                })
            });
        }
    }
    
    // Create an instance of MutationObserver with the callback
    var observer = new MutationObserver(callback);

    // Options for the observer
    var config = {
        childList: true,
        subtree: true
    };

    // Start observing the target node for configured mutations
    // Assuming you're observing changes within a specific container element
    // Replace 'containerSelector' with the actual selector of the container
    var container = document.querySelector('#app-mount');
    if (container) {
        observer.observe(container, config);
    } else {
        console.error("Container element not found for observing message changes.");
    }

    // To disconnect the observer when not needed
    // observer.disconnect();

    // background response listener - parse different actions for discord
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            let parsedCommand = JSON.parse(request.action);
            if (parsedCommand.message) {
                discordMessage(parsedCommand.message, parsedCommand.formatting);
            } else if (parsedCommand.status) {
                sendStatusRequest(parsedCommand.status)
                sendTopicRequest(parsedCommand.status)
            }
            if (parsedCommand.scrollBy) {
                window.scrollBy(0, request.scrollBy);
            }
        }
    );

    // discord message with simple queue for an array
    function discordMessage(messages, applyFormatting = true) {
        // Helper function to send a message with optional formatting
        function sendMsg(msg, formatting) {
            formatting ? sendMessageRequest(`\`\`\`${msg}\`\`\``) : sendMessageRequest(msg);
        }
        // Helper function to split and send long string messages
        function sendLongStringMessage(message, formatting) {
            const splitMessages = splitMessage(message); // Assuming splitMessage function exists to split long messages
            splitMessages.forEach((msg, i) => {
                const time = i * 1000;
                setTimeout(() => {
                    sendMsg(msg, formatting);
                }, time);
            });
        }

        if (Array.isArray(messages) && messages.every(item => typeof item === 'object' && 'message' in item)) {
            // Send each message in the array with a delay
            messages.forEach((item, i) => {
                const time = i * 1000;
                setTimeout(() => {
                    sendMsg(item.message, item.formatting);
                }, time);
            });
        } else if (typeof messages === 'string') {
            // Handle single string message
            if (messages.length <= 1500) {
                sendMsg(messages, applyFormatting);
            } else {
                sendLongStringMessage(messages, applyFormatting);
            }
        } else {
            console.error("Invalid input: messages should be either a string or an array of objects");
        }
    }

    // for splitting up large messages
    function splitMessage(message, maxLength = 1500) {
        const messageParts = [];
        let startIndex = 0;
        while (startIndex < message.length) {
            let endIndex = startIndex + maxLength;
            if (endIndex < message.length) {
                endIndex = message.lastIndexOf("\n", endIndex);
                if (endIndex <= startIndex) {
                    endIndex = startIndex + maxLength;
                }
            }
            messageParts.push(message.slice(startIndex, endIndex));
            startIndex = endIndex;
        }
        return messageParts;
    }


    function sendMessageRequest(text) {
        // build POST
        let request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open("POST", `https://discord.com/api/v6/channels/${CHANNEL_ID}/messages`);
        request.setRequestHeader("authorization", TOKEN);
        request.setRequestHeader("accept", "/");
        request.setRequestHeader("authority", "discord.com");
        request.setRequestHeader("content-type", "application/json");
        request.send(JSON.stringify({
            content: text
        }));
        console.log(JSON.stringify({
            content: text
        }));
    }

    function sendTopicRequest(status) {
        // build POST
        let request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open("PATCH", `https://discord.com/api/v9/channels/${CHANNEL_ID}`);
        request.setRequestHeader("authorization", TOKEN);
        request.setRequestHeader("accept", "/");
        request.setRequestHeader("authority", "discord.com");
        request.setRequestHeader("content-type", "application/json");
        request.send(JSON.stringify({
            bitrate: 64000,
            default_auto_archive_duration: null,
            name: "tv",
            nsfw: false,
            rate_limit_per_user: 0,
            rtc_region: null,
            topic: status,
            type: 0,
            user_limit: 0
        }));
        console.log('topic request sent')
    }

    function sendStatusRequest(status) {
        // build POST
        let request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open("PATCH", `https://discord.com/api/v9/users/@me/settings`);
        request.setRequestHeader("authorization", TOKEN);
        request.setRequestHeader("accept", "/");
        request.setRequestHeader("authority", "discord.com");
        request.setRequestHeader("content-type", "application/json");
        request.send(JSON.stringify({
            custom_status: {
                text: status
            }
        }));
    }

}