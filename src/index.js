import pagesData from "./data.json" assert { type: "json" };

const newMessage = (messagesContainer, message) => {
     messagesContainer.innerHTML += `${pagesData[message.type]} 
                                        <p style="color: rgb(170,170,170);">
                                             (${message.time})&#160 
                                        </p>
                                        <p style="font-weight: 700;">${message.from}</p>
                                        &#160para&#160
                                        <p style="font-weight: 700;">${message.to}:</p>
                                        &#160${message.text}
                                   </li> `;
     document.querySelector("main").scrollTo(0, document.querySelector("main").scrollHeight);
};
const serverDidNotReceiveMessage = () => {
     console.log("servidor não recebeu msg");
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
const clickFilter = (clickedButton) => {
     const inputHTML = document.querySelector("footer > input");
     if (inputHTML.value && clickedButton === "Enter") {
          generateNewUserMessage(inputHTML.value);
     }
     inputHTML.blur();
     inputHTML.value = "";
};
const eventListenersSetup = () => {
     document.querySelector("#sendButton").addEventListener("click", () => {
          messageFilter();
     });
     document.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === "Escape") {
               clickFilter(e.key);
          }
     });
     [document.querySelector("#sideMenuButton"), document.querySelector(".blackOpaque")].forEach(
          (item) => {
               item.addEventListener("click", () => {
                    document.querySelector("div.sideMenuContainer").classList.toggle("clicked");
               });
          }
     );
     console.log(document.querySelectorAll("ul.messagesModes li"));
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
          localeStoredServerMessages[localeStoredServerMessages.length - 1].time !==
          serverMessages[serverMessages.length - 1].time
     ) {
          localeStoredServerMessages.splice(0, 1);
          localeStoredServerMessages.push(serverMessages[serverMessages.length - 1]);
          newMessage(
               messagesContainer,
               localeStoredServerMessages[localeStoredServerMessages.length - 1]
          );
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
const connectionError = () => {
     console.log("Connection lost");
     Object.values(ids).forEach((id) => {
          clearInterval(id);
     });
};
const ids = {};
const loginSuccess = () => {
     // document.querySelector("body").innerHTML = pagesData.mainPage;
     eventListenersSetup();
     getMessagesFromServer();
     ids.connection = setInterval(() => {
          const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", user);
          connection.catch(connectionError);
     }, 5000);
     ids.loadMessages = setInterval(() => {
          getMessagesFromServer();
     }, 3000);
};
const loginError = () => {
     document.location.reload();
};
const user = { name: "Miguel" };
const loginCompleted = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", user);
loginCompleted.then(loginSuccess);
loginCompleted.catch(loginError);
