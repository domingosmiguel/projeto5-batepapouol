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
     } else if (message.type === "private_message") {
          messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <p style="color: rgb(170,170,170);">
                                                  (${message.time})&#160 
                                             </p>
                                             <p style="font-weight: 700;">${message.from}</p>
                                             &#160reservadamente para&#160
                                             <p style="font-weight: 700;">${message.to}:</p>
                                             &#160${message.text}
                                        </li> `;
     } else {
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
const generateNewUserMessage = (userMessageText) => {
     const userMessage = { from: user.name };
     userMessage.to = "Todos";
     userMessage.text = userMessageText;
     userMessage.type = "message";
     const sendMessageToServer = axios.post(
          "https://mock-api.driven.com.br/api/v6/uol/messages",
          userMessage
     );
     sendMessageToServer.then(getMessagesFromServer);
     sendMessageToServer.catch(serverDidNotReceiveMessage);
};
const messageDetailsSelector = (target, targetParent) => {
     const otherChildren = targetParent.querySelectorAll("li");
     otherChildren.forEach((child) => {
          child.classList.remove("check");
     });
     target.classList.add("check");
};
const messageFilter = (clickedButton) => {
     const inputHTML = document.querySelector("footer > input");
     if (inputHTML.value && clickedButton === "Enter") {
          generateNewUserMessage(inputHTML.value);
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
     document.querySelectorAll("ul.messagesModes li").forEach((item) => {
          item.addEventListener("click", (event) => {
               messageDetailsSelector(
                    event.path.find((target) => target.tagName === "LI"),
                    event.path.find((target) => target.tagName === "LI").parentNode
               );
          });
     });
};
const localeStoredServerMessages = [];

const storeServerMessages = (serverPromise) => {
     const messagesContainer = document.querySelector("ul.serverMessages");
     const serverMessages = serverPromise.data;
     if (localeStoredServerMessages.length === 0) {
          serverMessages.forEach((serverMessage) => {
               newMessage(messagesContainer, serverMessage);
               localeStoredServerMessages.push(serverMessage);
          });
     } else if (
          localeStoredServerMessages[localeStoredServerMessages.length - 1].from !==
               serverMessages[serverMessages.length - 1].from ||
          localeStoredServerMessages[localeStoredServerMessages.length - 1].to !==
               serverMessages[serverMessages.length - 1].to ||
          localeStoredServerMessages[localeStoredServerMessages.length - 1].text !==
               serverMessages[serverMessages.length - 1].text ||
          localeStoredServerMessages[localeStoredServerMessages.length - 1].type !==
               serverMessages[serverMessages.length - 1].type ||
          localeStoredServerMessages[localeStoredServerMessages.length - 1].time !==
               serverMessages[serverMessages.length - 1].time
     ) {
          localeStoredServerMessages.splice(0, 1);
          localeStoredServerMessages.push(serverMessages[serverMessages.length - 1]);
          newMessage(
               messagesContainer,
               localeStoredServerMessages[localeStoredServerMessages.length - 1]
          );
          if (serverMessages[serverMessages.length - 1].type === "status") {
               switch (serverMessages[serverMessages.length - 1].text) {
                    case "entra na sala...":
                         newUserOnline(serverMessages[serverMessages.length - 1].from);
                         break;
                    case "sai da sala...":
                         newUserOffline(serverMessages[serverMessages.length - 1].from);
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
     promiseFromServer.then(storeServerMessages);
     promiseFromServer.catch(didNotLoadServerMessages);
};
const eventListenersForUsersCards = () => {
     document.querySelectorAll("ul.users li").forEach((item) => {
          item.addEventListener("click", (event) => {
               messageDetailsSelector(
                    event.path.find((target) => target.tagName === "LI"),
                    event.path.find((target) => target.tagName === "LI").parentNode
               );
          });
     });
};
const newUserOnline = (userName) => {
     const usersContainer = document.querySelector("ul.users");
     usersContainer.innerHTML += `<li>
                                        <p>
                                             <ion-icon name="person-circle"></ion-icon>&#160&#160${userName}
                                        </p>
                                        <ion-icon name="checkmark-outline"></ion-icon>
                                   </li>`;
     eventListenersForUsersCards();
};
const newUserOffline = (userName) => {
     const usersCards = document.querySelectorAll("ul.users > li:not(:first-child)");
     Object.values(usersCards).some((card) => {
          const userFromCard = Object.values(card.childNodes).find(
               (tag) => tag.tagName === "P"
          ).textContent;
          const formattedUserFromCard = userFromCard.slice(
               userFromCard.indexOf(userName),
               userFromCard.indexOf(userName) + userName.length
          );
          if (userName == formattedUserFromCard) {
               card.remove();
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
          const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", user);
          connection.catch(connectionError);
     }, 5000);
     ids.loadMessages = setInterval(() => {
          getMessagesFromServer();
     }, 3000);
     // ids.loadUsers = setInterval(() => {
     //      getUsersOnline();
     // }, 10000);
};
const loginError = (error) => {
     document.querySelector("#errorMessage").innerHTML = error.message;
     // document.location.reload();
};
const user = {};

const loginLogic = () => {
     document.querySelector("#loginButton").addEventListener("click", () => {
          if (document.querySelector("#userName").value) {
               user.name = document.querySelector("#userName").value;
               const loginRequest = axios.post(
                    "https://mock-api.driven.com.br/api/v6/uol/participants",
                    user
               );
               loginRequest.then(loginSuccess);
               loginRequest.catch(loginError);
          }
     });
};

loginLogic();
