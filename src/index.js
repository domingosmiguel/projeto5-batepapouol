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
};
const loadMessagesFromServer = (messagesFromServer) => {
     const messagesContainer = document.querySelector("ul.serverMessages");
     messagesContainer.innerHTML = "";
     messagesFromServer.data.forEach((serverMessage) => {
          newMessage(messagesContainer, serverMessage);
     });
     document.querySelector("main").scrollTo(0, document.querySelector("main").scrollHeight);
};
const didNotLoadMessagesFromServer = () => {
     console.log("não carregou mensagens do servidor");
};
const getMessagesFromServer = () => {
     const messagesFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
     messagesFromServer.then(loadMessagesFromServer);
     messagesFromServer.catch(didNotLoadMessagesFromServer);
};
const connectionError = (error) => {
     console.log("deu ruim");
     clearInterval(id);
};
let id = null;
const loginSuccess = () => {
     eventListenersSetup();
     getMessagesFromServer();
     id = setInterval(() => {
          const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", user);
          // Review the need to update all messages every 5s, there are better ways (requirement is 3s)
          connection.then(getMessagesFromServer);
          connection.catch(connectionError);
     }, 5000);
};
const loginError = () => {
     document.location.reload();
};
const user = { name: "Miguel" };
const loginCompleted = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", user);
loginCompleted.then(loginSuccess);
loginCompleted.catch(loginError);
