import pagesData from "./data.json" assert { type: "json" };

const newMessage = (messagesContainer, message) => {
     if (message.type === "status") {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})&#160 
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             &#160${message.text}
                                        </li> `;
     } else if (
          message.type === "private_message" &&
          (message.to === (userMessage.name || "Todos") || message.from === userMessage.name)
     ) {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})&#160 
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             &#160reservadamente&#160para&#160
                                             <p style="font-weight: 700;">${message.to}:</p>
                                             &#160${message.text}
                                        </li> `;
     } else if (message.type === "message") {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})&#160 
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             &#160para&#160
                                             <p style="font-weight: 700;">${message.to}:</p>
                                             &#160${message.text}
                                        </li> `;
     }
     document.querySelector("main").scrollTo(0, document.querySelector("main").scrollHeight);
};
const serverDidNotReceiveMessage = () => {
     console.log("server did not receive message");
};
const sendNewUserMessage = (userMessageText) => {
     userMessage.text = userMessageText;
     const sendMessageToServer = axios.post(
          "https://mock-api.driven.com.br/api/v6/uol/messages",
          userMessage
     );
     sendMessageToServer.then(getMessagesFromServer);
     sendMessageToServer.catch(serverDidNotReceiveMessage);
};
const messageSettingsSelector = (target, targetParent) => {
     const allChildren = targetParent.querySelectorAll("li");
     allChildren.forEach((child) => {
          child.classList.remove("check");
     });
     target.classList.add("check");
     messagePrivacyAndDestination(
          target.querySelector("div").querySelector("div").querySelector("div").innerHTML,
          targetParent
     );
};
const messageFilter = (clickedButton) => {
     const inputHTML = document.querySelector("footer > div > input");
     if (inputHTML.value && clickedButton === "Enter") {
          sendNewUserMessage(inputHTML.value);
     }
     inputHTML.blur();
     inputHTML.value = "";
};
const eventListenersSetup = () => {
     document.querySelector("#sendButton").addEventListener("click", () => {
          messageFilter("Enter");
     });
     document.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === "Escape") {
               messageFilter(e.key);
          }
     });
     [document.querySelector("#sideMenuButton"), document.querySelector(".blackOpaque")].forEach(
          (item) => {
               item.addEventListener("click", () => {
                    document.querySelector("div.sideMenuContainer").classList.toggle("clicked");
               });
          }
     );
     document.querySelectorAll("ul.messageModes li").forEach((item) => {
          item.addEventListener("click", (event) => {
               messageSettingsSelector(
                    event.path.find((target) => target.tagName === "LI"),
                    event.path.find((target) => target.tagName === "LI").parentNode
               );
          });
     });
};
const messagePrivacyAndDestination = (info, type) => {
     let messagePrivacy = false;
     switch (type.classList.value) {
          case "messageModes":
               messagePrivacy = info;
               userMessage.to = document
                    .querySelector("ul.users > li.check")
                    .querySelector("div.userName").innerHTML;
               break;
          case "users":
               messagePrivacy = document
                    .querySelector("ul.messageModes > li.check")
                    .querySelector("div.msgPrivacy").innerHTML;
               userMessage.to = info;
               break;
     }
     switch (messagePrivacy) {
          case "Público":
               document.querySelector(
                    "div.msg-infos"
               ).innerHTML = `Enviando para ${userMessage.to}`;
               userMessage.type = "message";
               break;
          case "Reservadamente":
               document.querySelector(
                    "div.msg-infos"
               ).innerHTML = `Enviando para ${userMessage.to} (Reservadamente)`;
               userMessage.type = "private_message";
               break;
     }
     console.log(userMessage);
};
let LastRenderedMessage = false;

const renderServerMessages = (serverPromise) => {
     const messagesContainer = document.querySelector("ul.serverMessages");
     const serverMessages = serverPromise.data;
     if (!LastRenderedMessage) {
          serverMessages.forEach((serverMessage) => {
               newMessage(messagesContainer, serverMessage);
          });
          LastRenderedMessage = serverMessages[serverMessages.length - 1];
     } else if (serverMessages[serverMessages.length - 1].time !== LastRenderedMessage.time) {
          LastRenderedMessage = serverMessages[serverMessages.length - 1];
          for (let i = serverMessages.length - 2; i > 0; i--) {
               if (serverMessages[i].time !== LastRenderedMessage.time) {
                    for (i++; i < serverMessages.length; i++) {
                         newMessage(messagesContainer, serverMessages[i]);
                         if (serverMessages[i].type === "status") {
                              switch (serverMessages[i].text) {
                                   case "entra na sala...":
                                        newUserOnline(serverMessages[i].from);
                                        break;
                                   case "sai da sala...":
                                        newUserOffline(serverMessages[i].from);
                                        break;
                              }
                         }
                    }
                    break;
               }
          }
     }
};
const didNotLoadServerMessages = () => {
     console.log("Did not load server messages");
};
const getMessagesFromServer = () => {
     const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
     promiseFromServer.then(renderServerMessages);
     promiseFromServer.catch(didNotLoadServerMessages);
};
const eventListenersForUsersCards = () => {
     document.querySelectorAll("ul.users li").forEach((item) => {
          item.addEventListener("click", (event) => {
               messageSettingsSelector(
                    event.path.find((target) => target.tagName === "LI"),
                    event.path.find((target) => target.tagName === "LI").parentNode
               );
          });
     });
};
const newUserOnline = (userName) => {
     const usersContainer = document.querySelector("ul.users");
     usersContainer.innerHTML += `<li data-identifier="participant">
                                        <div>
                                             <ion-icon name="person-circle"></ion-icon>
                                             <div><div class="userName">${userName}</div></div>
                                        </div>
                                        <ion-icon name="checkmark-outline"></ion-icon>
                                   </li>`;
     eventListenersForUsersCards();
};
const newUserOffline = (userName) => {
     const usersCards = document.querySelectorAll("ul.users > li:not(:first-child)");
     Object.values(usersCards).some((card) => {
          const userFromCard = card.querySelector("div.userName").innerHTML;
          if (userName == userFromCard) {
               card.remove();
               if (card.classList.value === "check") {
                    const targetParent = document.querySelector("ul.users");
                    const target = targetParent.querySelector("li:first-child");
                    messageSettingsSelector(target, targetParent);
               }
               return true;
          }
          return false;
     });
};
const renderUsersOnlineForTheFirstTime = (serverPromise) => {
     const usersOnline = serverPromise.data;
     usersOnline.forEach((user) => {
          newUserOnline(user.name);
     });
};
const didNotLoadUsersOnline = () => {
     console.log("Did not load users online");
};
const getUsersOnline = () => {
     const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
     promiseFromServer.then(renderUsersOnlineForTheFirstTime);
     promiseFromServer.catch(didNotLoadUsersOnline);
};
const connectionError = () => {
     document.querySelector("body").innerHTML = pagesData.loginPage;
     document.querySelector("#errorMessage").innerHTML = "Lost server connection";
     Object.values(ids).forEach((id) => {
          clearInterval(id);
     });
     localeStoredServerMessages.splice(0);
     loginLogic();
};
const ids = {};

const loginSuccess = () => {
     document.querySelector("body").innerHTML = pagesData.mainPage;
     eventListenersSetup();
     getMessagesFromServer();
     getUsersOnline();
     ids.connection = setInterval(() => {
          const connection = axios.post(
               "https://mock-api.driven.com.br/api/v6/uol/status",
               userMessage
          );
          connection.catch(connectionError);
     }, 5000);
     ids.loadMessages = setInterval(() => {
          getMessagesFromServer();
     }, 3000);
};
const loginError = (error) => {
     document.querySelector("#errorMessage").innerHTML = error.message;
};
const userMessage = {};

const loginLogic = () => {
     document.querySelector("#loginButton").addEventListener("click", () => {
          if (document.querySelector("#userName").value) {
               userMessage.name = userMessage.from = document.querySelector("#userName").value;
               userMessage.to = "Todos";
               userMessage.type = "message";
               const loginRequest = axios.post(
                    "https://mock-api.driven.com.br/api/v6/uol/participants",
                    userMessage
               );
               loginRequest.then(loginSuccess);
               loginRequest.catch(loginError);
          }
     });
};

loginLogic();
