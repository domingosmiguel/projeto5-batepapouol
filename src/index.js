import pagesData from "./data.json" assert { type: "json" };

const newMessage = (message) => {
     const chatBox = document.querySelector("ul.serverMessages");
     chatBox.innerHTML += `${pagesData[message.type]} 
                              <p style="color: rgb(170,170,170);">
                              (${message.time})&#160 
                              </p>
                              <p style="font-weight: 700;">${message.from}</p>
                              &#160for&#160
                              <p style="font-weight: 700;">${message.to}:</p>
                              &#160${message.text}
                         </li> `;
};
const serverReceivedMessage = () => {
     getMessagesFromServer();
};
const serverDidNotReceiveMessage = () => {
     console.log("servidor não recebeu msg");
};
const generateNewUserMessage = (userMessageText) => {
     const time = new Date();
     const userMessage = { from: user.name };
     userMessage.to = "Todos";
     userMessage.text = userMessageText;
     userMessage.type = "message";
     const sendMessageToServer = axios.post(
          "https://mock-api.driven.com.br/api/v6/uol/messages",
          userMessage
     );
     sendMessageToServer.then(serverReceivedMessage);
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
};
const loadMessagesFromServer = (messagesFromServer) => {
     messagesFromServer.data.forEach((serverMessage) => {
          newMessage(serverMessage);
     });
     window.scrollTo(0, document.body.scrollHeight);
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
     console.log("Mensagem de erro: " + error.response.data); // Ex: Not Found
     console.log("Status code: " + error.response.status); // Ex: 404
     console.log("deu ruim");
     // document.location.reload();
};
// const connectionOK = () => {
//      console.log("ok");
// };
const loginSuccess = () => {
     document.querySelector("body").innerHTML = pagesData.mainPage;
     eventListenersSetup();
     getMessagesFromServer();
     setInterval(() => {
          const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", user);
          // connection.then(connectionOK);
          connection.then(getMessagesFromServer);
          connection.catch(connectionError);
     }, 5000);
};
const loginError = (error) => {
     // console.log("Mensagem de erro: " + error.response.data); // Ex: Not Found
     // console.log("Status code: " + error.response.status); // Ex: 404
     document.location.reload();
};
const user = { name: "Miguel" };
const loginCompleted = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", user);
loginCompleted.then(loginSuccess);
loginCompleted.catch(loginError);
