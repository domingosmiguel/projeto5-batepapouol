import pagesData from "./data.json" assert { type: "json" };

const newMessage = (messagesContainer, message) => {
     if (message.type === "status") {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             <p>${message.text}</p>
                                        </li> `;
     } else if (
          message.type === "private_message" &&
          (message.to === userMessage.name ||
               message.to === "Todos" ||
               message.from === userMessage.name)
     ) {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             <p> reservadamente para </p>
                                             <p style="font-weight: 700;">${message.to}:</p>
                                             <p>${message.text}</p>
                                        </li> `;
     } else if (message.type === "message") {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             <p> para </p>
                                             <p style="font-weight: 700;">${message.to}:</p>
                                             <p> ${message.text}</p>
                                        </li> `;
     }
     document.querySelector("main").scrollTo(0, document.querySelector("main").scrollHeight);
};
const sendNewUserMessage = (userMessageText) => {
     userMessage.text = userMessageText;
     const sendMessageToServer = axios.post(
          "https://mock-api.driven.com.br/api/v6/uol/messages",
          userMessage
     );
     sendMessageToServer.then(getMessagesFromServer);
     sendMessageToServer.catch(connectionError);
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
     } else if (clickedButton === "Escape") {
          inputHTML.blur();
     }
     inputHTML.value = "";
};
const eventListenersSetup = () => {
     document.querySelector("#sendButton").addEventListener("click", () => {
          messageFilter("Enter");
     });
     document.querySelector("div.messagesContainer").addEventListener("keydown", (e) => {
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
               ).innerHTML = `Enviando para ${userMessage.to} (reservadamente)`;
               userMessage.type = "private_message";
               break;
     }
};
let LastRenderedMessage = false;

const renderServerMessages = (serverPromise) => {
     const messagesContainer = document.querySelector("ul.serverMessages");
     const serverMessages = serverPromise.data;
     if (!LastRenderedMessage) {
          serverMessages.forEach((serverMessage) => {
               newMessage(messagesContainer, serverMessage);
          });
     } else if (serverMessages[serverMessages.length - 1].time !== LastRenderedMessage.time) {
          for (let i = serverMessages.length - 2; i > 0; i--) {
               if (serverMessages[i].time === LastRenderedMessage.time) {
                    for (i++; i < serverMessages.length; i++) {
                         newMessage(messagesContainer, serverMessages[i]);
                    }
                    break;
               }
          }
     }
     LastRenderedMessage = serverMessages[serverMessages.length - 1];
};
const getMessagesFromServer = () => {
     const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
     promiseFromServer.then(renderServerMessages);
     promiseFromServer.catch(connectionError);
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
const newOnlineUser = (userName) => {
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
const newOfflineUser = (userName) => {
     const targetParent = document.querySelector("ul.users");
     const usersCards = targetParent.querySelectorAll("li:not(:first-child)");
     Object.values(usersCards).some((card) => {
          const userFromCard = card.querySelector("div.userName").innerHTML;
          if (userName == userFromCard) {
               card.remove();
               if (card.classList.value === "check") {
                    const allTargets = targetParent.querySelectorAll("li");
                    Object.values(allTargets).some((target) => {
                         const userCard = target.querySelector("div.userName").innerHTML;
                         if (userCard === userMessage.name) {
                              messageSettingsSelector(target, targetParent);
                              return true;
                         }
                         return false;
                    });
               }
               return true;
          }
          return false;
     });
};
let localListOfOnlineUsers = false;

const renderOnlineUsers = (serverPromise) => {
     const serverUsers = serverPromise.data;
     if (!localListOfOnlineUsers) {
          serverUsers.forEach((user) => {
               newOnlineUser(user.name);
          });
     } else {
          const offlineUsers = localListOfOnlineUsers.slice(0);
          const onlineUsers = serverUsers.slice(0);
          onlineUsers.forEach((onlineUser, i) => {
               offlineUsers.some((offlineUser, j) => {
                    if (onlineUser.name === offlineUser.name) {
                         onlineUsers[i] = false;
                         offlineUsers[j] = false;
                         return true;
                    }
                    return false;
               });
          });
          onlineUsers.forEach((onlineUser) => {
               if (onlineUser) {
                    newOnlineUser(onlineUser.name);
               }
          });
          offlineUsers.forEach((offlineUser) => {
               if (offlineUser) {
                    newOfflineUser(offlineUser.name);
               }
          });
     }
     localListOfOnlineUsers = serverUsers;
};
const getOnlineUsers = () => {
     const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
     promiseFromServer.then(renderOnlineUsers);
     promiseFromServer.catch(connectionError);
};
const connectionError = (error) => {
     Object.values(ids).forEach((id) => {
          clearInterval(id);
          console.log(id);
     });
     localListOfOnlineUsers = false;
     LastRenderedMessage = false;
     loginPageLogic(error.config.url);
};
const keepConnection = () => {
     const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", userMessage);
     connection.catch(connectionError);
};
const ids = {};

const loginSuccess = () => {
     document.querySelector("body").innerHTML = pagesData.mainPage;
     document.querySelector("div.msg-infos").innerHTML = `Enviando para Todos`;
     userMessage.to = "Todos";
     userMessage.type = "message";
     eventListenersSetup();
     getMessagesFromServer();
     getOnlineUsers();
     ids.connection = setInterval(() => {
          keepConnection();
     }, 5000);
     ids.loadMessages = setInterval(() => {
          getMessagesFromServer();
     }, 3000);
     ids.OnlineUsers = setInterval(() => {
          getOnlineUsers();
     }, 10000);
};
const loginError = () => {
     document.querySelector("#loginButton").classList.remove("hidden");
     document.querySelector("#userName").classList.remove("hidden");
     document.querySelector(".loader").classList.add("hidden");
     document.querySelector(
          "#errorMessage"
     ).innerHTML = `Por favor, insira outro nome de usuário pois este já está em uso`;
};
const userMessage = {};

const loginLogic = (clickedButton) => {
     if (
          document.querySelector("#userName").value &&
          (clickedButton === "Enter" || clickedButton === "clicked")
     ) {
          document.querySelector("#loginButton").classList.add("hidden");
          document.querySelector("#userName").classList.add("hidden");
          document.querySelector(".loader").classList.remove("hidden");
          userMessage.from = userMessage.name = document.querySelector("#userName").value;
          const loginRequest = axios.post(
               "https://mock-api.driven.com.br/api/v6/uol/participants",
               userMessage
          );
          loginRequest.then(loginSuccess);
          loginRequest.catch(loginError);
     }
};
const loginPageListeners = () => {
     document.querySelector("#loginButton").addEventListener("click", () => {
          loginLogic("clicked");
     });
     document.querySelector("main.loginPage").addEventListener("keypress", (e) => {
          loginLogic(e.key);
     });
};
const loginPageLogic = (errorConfigURL) => {
     document.querySelector("body").innerHTML = pagesData.loginPage;
     loginPageListeners();
     switch (errorConfigURL) {
          case "https://mock-api.driven.com.br/api/v6/uol/status":
               document.querySelector("#errorMessage").innerHTML = "Lost server connection";
               break;
          case "https://mock-api.driven.com.br/api/v6/uol/messages":
               document.querySelector("#errorMessage").innerHTML = "Couldn't load new messages";
               break;
          case "https://mock-api.driven.com.br/api/v6/uol/participants":
               document.querySelector("#errorMessage").innerHTML = "Couldn't load online users";
               break;
     }
};
loginPageLogic();
