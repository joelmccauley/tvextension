/**
 * @fileoverview Awesome sauce
 */
const PROVIDER_URL = "*://*.2hthost.com/*";
const SPORTS_URL = "https://buffstreams.ai/*";
const DISCORD_URL = "https://discord.com/*";
const TV_HOME_URL = "http://web.2hthost.com/live-list.php?c=MjU=";

chrome.runtime.onMessage.addListener(function (request) {
  console.log("request", request);
  // setup storage
  var dataSource = {};
  chrome.storage.onChanged.addListener(function (changes) {
    for (let [key, { old, newValue }] of Object.entries(changes)) {
      dataSource[key] = newValue;
    }
  });
  chrome.storage.sync.get(null, async function (data) {
    dataSource = data; // apply dataSource variable
    /* BOT STARTS HERE */
    // parse the possibility of multiple commands, do not lowercase youtube/spotify links
    const rawCommands = JSON.parse(request.action);
    let commands;
    console.log("raw commands", rawCommands);
    //if (rawCommands?.first?.includes("youtube.com") || rawCommands?.first?.includes("spotify.com") || rawCommands?.first?.includes("netflix.com")) {
    if (
      rawCommands?.first?.includes("youtube.com") ||
      rawCommands?.first?.includes("spotify.com") ||
      rawCommands?.first?.includes("netflix.com")
    ) {
      commands = rawCommands;
    } else {
      commands = {
        first: rawCommands.first ? rawCommands.first.toLowerCase() : null,
        second: rawCommands.second ? rawCommands.second.toLowerCase() : null,
        full: rawCommands.full ? rawCommands.full.toLowerCase() : null,
      };
      if (
        commands.first === "gpt-response" ||
        commands.first === "$+discord-message"
      )
        commands.second = rawCommands.second;
    }

    // run these queries to get the tabs
    chrome.tabs.query(
      {
        url: DISCORD_URL,
      },
      function (result) {
        if (result.length) {
          setTab("discord", result[0].id, result[0].url, result[0].windowId);
        }
      }
    );
    chrome.tabs.query(
      {
        url: [PROVIDER_URL, SPORTS_URL],
      },
      function (result) {
        if (result.length) {
          setTab("provider", result[0].id, result[0].url, result[0].windowId);
        }
      }
    );
    // set the tabs
    function setTab(tabType, tabId, tabUrl, windowId) {
      switch (tabType) {
        case "discord":
          chrome.storage.sync.set({
            discordTabId: tabId,
            discordUrl: tabUrl,
            discordWindowId: windowId,
          });
          break;
        case "provider":
          chrome.storage.sync.set({
            providerTabId: tabId,
            providerUrl: tabUrl,
            providerWindowId: windowId,
          });
          break;
      }
    }
    // send discord message to the tab
    function message(msg, sendStatus = false, formatting = true) {
      let msgString = JSON.stringify({
        message: msg,
        formatting: formatting,
      });
      chrome.tabs.sendMessage(dataSource["discordTabId"], {
        action: msgString,
      });
      if (sendStatus) {
        status(msg);
      }
    }
    // update discord status
    function status(msg) {
      let msgString = JSON.stringify({
        status: msg,
      });
      chrome.tabs.sendMessage(dataSource["discordTabId"], {
        action: msgString,
      });
      chrome.tabs.update(dataSource["providerTabId"], {
        highlighted: true,
      });
    }
    function maxWindow() {
      chrome.windows.update(dataSource["providerWindowId"], {
        state: "fullscreen",
      });
    }
    executeCommand(commands);

    function executeCommand(commands) {
      console.log(commands);
      // refresh help / commands
      if (commands.first === "help" || commands.first === "commands") {
        helpCommand();
      } else if (commands.first === "$+discord-message") {
        message(commands.second);
      } else if (commands.first === "about") {
        aboutCommand();
      } else if (commands.first === "changelog") {
        changelogCommand();
      } else if (commands.first === "sports") {
        console.log("second command", commands.second);
        sportsCommand(commands.second);
      }
    }

    function helpCommand() {
      var commandsList = [
        "ini",
        "[Commands]",
        "!help",
        "!<channel name>          - change channel, ex: !fox news",
        "!reload                  - reload the bot",
        "!about                   - about TVBot",
        "!changelog               - view the log of changes",
        "",
        "[Tips]",
        "* If you encounter anything unfamiliar, use the !reload command.",
        "* Channels and categories support wildcards, simply: !nfl will take you to nfl network.",
        "* You will recieve channel not found if in the wrong category, use !reload to get back to USA channels.",
        "* Most commands have shortened variations !c <category> = category, !m = movie, !r = random, etc.",
      ].join("\n");
      message(commandsList);
    }

    function aboutCommand() {
      var commandsList = [
        "ini",
        "[TVBOT v0.7]",
        "",
        "TVBot was born out of the homies watching TV on Discord. It has now evolved to support endless channels and entertainment.",
        "The first and only bot of it's kind, Trump 2024.",
        "",
        "TVBot's birthday is March 7th, 2021.",
      ].join("\n");
      message(commandsList);
    }

    function changelogCommand() {
      var commandsList = [
        "ini",
        "[TVBOT v2.0 BETA]",
        "",
        "v0.1 - current version",
        " - !<channel name>",
      ].join("\n");
      message(commandsList);
    }

    function sportsCommand(second = undefined) {
      if (second) {
        sportsNavigate(second);
      } else {
        sportsList();
      }
    }

    function sportsList() {
      chrome.tabs.update(dataSource["providerTabId"], {
        url: SPORTS_URL,
      });
      message("Getting sports list..", false, true);
      setTimeout(() => {
        function inContent() {
          let messages = [];
          let link = "https://buffstreams.ai/";
          const sportsCategories = document.querySelectorAll(".top-tournament");
          const getTodaysDateFormatted = () =>
            `${new Date().getMonth() + 1}`.padStart(2, "0") +
            "/" +
            `${new Date().getDate()}`.padStart(2, "0") +
            "/" +
            new Date().getFullYear().toString().substr(-2);
          const today = getTodaysDateFormatted();
          messages.push(`Available Streams ${today}:`);
          sportsCategories.forEach((category, index) => {
            // Get category image and name
            const imgSrc = category.querySelector("img").src;
            let categoryName = category
              .querySelector(".league-name")
              .textContent.trim();
            // Trim "Links" from the categoryName
            categoryName = categoryName
              .replace(/Links/gi, "")
              .replace(/Upcoming/gi, "")
              .trim();
            messages.push(imgSrc); // Image URL
            // Loop through each competition in the category
            let categoryMessage = categoryName + "\n--\n";
            const competitions = category.querySelectorAll(".competition");
            competitions.forEach((comp, compIndex) => {
              // Get the link of the very first competition
              if (index === 0 && compIndex === 0) {
                link = comp.href;
              }

              let competitionDetails;
              const detailedTeams = comp.querySelector(
                ".competition-cell-side1 .name"
              );

              if (detailedTeams) {
                // Detailed structure with separate elements for teams and time
                const team1 = detailedTeams.textContent.trim();
                const team2 = comp
                  .querySelector(".competition-cell-side2 .name")
                  .textContent.trim();
                const timeElement = comp.querySelector(
                  ".competition-cell-status"
                );
                const scoreElement = comp.querySelector(
                  ".competition-cell-score"
                );
                let time = timeElement ? timeElement.textContent.trim() : null;
                let score = scoreElement
                  ? scoreElement.textContent.trim()
                  : null;
                let easternTime;
                if (time) {
                  const today = new Date().toISOString().slice(0, 10);
                  const dateTimeString = `${today} ${time}`;
                  const date = new Date(dateTimeString);
                  // Adjust the time (subtracting 4 hours)
                  date.setHours(date.getHours() - 5);
                  easternTime = date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                }

                let end;
                if (score.includes("AM") || score.includes("PM")) {
                  end = easternTime;
                } else {
                  end = score;
                }
                competitionDetails = `${team1} vs ${team2} - ${end}`
                  .replace(/\s+/g, " ")
                  .trim();
              } else {
                // Simpler structure where competition details are within a single <div>
                let content = comp.querySelector("div").textContent.trim();
                // Clean up and replace dashes with 'vs' for better formatting
                competitionDetails = content.replace(/\s+/g, " ").trim();
              }

              categoryMessage += competitionDetails + "\n";
            });

            messages.push(categoryMessage); // Competition Details
          });
          return {
            link: link,
            messages: messages,
          };
        }
        chrome.scripting.executeScript(
          {
            target: {
              tabId: dataSource["providerTabId"],
            },
            func: inContent,
          },
          (res) => {
            let result = res[0].result;
            // Construct an array of message objects with specific formatting
            const messageObjects = result.messages.map((msg) => {
              return {
                message: msg,
                formatting: !msg.startsWith("http"), // No formatting for URLs (assuming images are URLs)
              };
            });
            message(messageObjects);
          }
        );
      }, 4000);
    }

    function tvQuickChannel(homeChannel) {
      function inContent(gotoChannel) {
        window.findChannel(gotoChannel);
        let selectedChannel = window.currentChannel;
        return selectedChannel;
      }
      let reqChannel = homeChannel ? homeChannel : commands.full;
      if (reqChannel === "espn") reqChannel = "espn fhd"; //espn fix
      console.log(reqChannel);
      if (reqChannel !== "cnn") {
        chrome.scripting.executeScript(
          {
            target: {
              tabId: dataSource["providerTabId"],
            },
            function: inContent,
            args: [reqChannel],
          },
          (res) => {
            let channel = res[0].result;
            if (channel) {
              message(`ini${"\n"}[Channel] ${channel.name}`);
              setTimeout(() => {
                message(channel.logo, false, false);
              }, 500);
              status(`Watching: ${channel.name}`);
            } else {
              message(
                `fix${"\n"}Channel not found (current category: ${
                  dataSource["currentCategory"]
                })`
              );
            }
          }
        );
      } else {
        // nope
        message(
          "Trump Won 2020: https://hereistheevidence.com/ || https://patriots.win"
        );
      }
    }
  });
});
