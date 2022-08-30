import pagesData from "./data.json" assert { type: "json" };

const userMessage = {};
const ids = {};

let lastRenderedMessages = false;
let localListOfOnlineUsers = false;

const setMessageTimeToLocation = (message) => {
    let localTime = message.time.slice(0, 2) - 3;
    if (localTime <= 0) {
        localTime += 12;
    }
    localTime = (localTime + 100).toString().slice(-2) + message.time.slice(-6);

    return localTime;
};
const privateAndRelevantMessage = (message) => {
    if (
        message.type === "private_message" &&
        (message.to === userMessage.name ||
            message.to === "Todos" ||
            message.from === userMessage.name)
    ) {
        return true;
    }
    return false;
};
const newMessage = (message) => {
    const localTime = setMessageTimeToLocation(message);
    const messagesContainer = document.querySelector("ul.serverMessages");

    if (message.type === "status") {
        messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <b class="time">
                                                  (${localTime})&nbsp
                                             </b>
                                             <b>${message.from}&nbsp</b>
                                             ${message.text}
                                        </p></li>`;
    } else if (privateAndRelevantMessage(message)) {
        messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <b class="time">
                                                  (${localTime})&nbsp
                                             </b>
                                             <b>${message.from}</b>
                                             reservadamente para
                                             <b>${message.to}:&nbsp</b>
                                             ${message.text}
                                        </p></li>`;
    } else if (message.type === "message") {
        messagesContainer.innerHTML += `${pagesData[message.type]} 
                                             <b class="time">
                                                  (${localTime})&nbsp
                                             </b>
                                             <b>${message.from}</b>
                                             para
                                             <b>${message.to}:&nbsp</b>
                                             ${message.text}
                                        </p></li>`;
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
const messageFilter = (clickedButton = "Enter") => {
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
        messageFilter();
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
    let messagePrivacy;
    switch (type.classList.value) {
        case "messageModes": {
            messagePrivacy = info;
            userMessage.to = document
                .querySelector("ul.users > li.check")
                .querySelector("div.userName").innerHTML;
            break;
        }
        case "users": {
            messagePrivacy = document
                .querySelector("ul.messageModes > li.check")
                .querySelector("div.msgPrivacy").innerHTML;
            userMessage.to = info;
            break;
        }
    }
    switch (messagePrivacy) {
        case "Público": {
            document.querySelector("div.msg-infos").innerHTML = `Enviando para ${userMessage.to}`;
            userMessage.type = "message";
            break;
        }
        case "Reservadamente": {
            document.querySelector(
                "div.msg-infos"
            ).innerHTML = `Enviando para ${userMessage.to} (reservadamente)`;
            userMessage.type = "private_message";
            break;
        }
    }
};
const sameMessage = (lastRenderedMessage, serverMessage) => {
    if (
        lastRenderedMessage.text === serverMessage.text &&
        lastRenderedMessage.time === serverMessage.time &&
        lastRenderedMessage.from === serverMessage.from &&
        lastRenderedMessage.to === serverMessage.to &&
        lastRenderedMessage.type === serverMessage.type
    ) {
        return true;
    }
    return false;
};
const findOldestMessageWithSameTime = (serverMessages) => {
    const initialValue = -1;
    const lastIndexWithSameTime = serverMessages.reduce((accumulator, serverMessage, index) => {
        if (lastRenderedMessages[0].time === serverMessage.time) {
            return index;
        }
        return accumulator;
    }, initialValue);
    return lastIndexWithSameTime;
};
const filterMessagesToRender = (latestMessage) => {
    const value = lastRenderedMessages.find((lastRenderedMessage) => {
        const theyAreEqual = sameMessage(lastRenderedMessage, latestMessage);
        if (theyAreEqual) return true;
        return false;
    });
    if (!value) return true;
    return false;
};
const pickMessagesToRender = (serverMessages) => {
    const index = findOldestMessageWithSameTime(serverMessages);
    const sliceEnd = index + 1;
    const latestMessages = serverMessages.slice(0, sliceEnd);
    const messagesToRender = latestMessages.filter(filterMessagesToRender);

    return messagesToRender;
};
const handleServerMessages = (serverPromise) => {
    const serverMessages = serverPromise.data.reverse();
    let messagesToRender;
    if (!lastRenderedMessages) {
        messagesToRender = serverMessages.slice();
    } else {
        messagesToRender = pickMessagesToRender(serverMessages);
    }
    messagesToRender.reverse().forEach((serverMessage) => {
        newMessage(serverMessage);
    });
    atualizeLastRenderedMessages(serverMessages);
};
const atualizeLastRenderedMessages = (serverMessages) => {
    lastRenderedMessages = [];
    serverMessages.every((serverMessage) => {
        if (serverMessage.time !== serverMessages[0].time) {
            return false;
        }
        lastRenderedMessages.push(serverMessage);
        return true;
    });
};
const getMessagesFromServer = () => {
    const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promiseFromServer.then(handleServerMessages);
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
const findLocalUserCard = (card) => {
    const userOnTheCard = card.querySelector("div.userName").innerHTML;
    if (userOnTheCard === userMessage.name) {
        messageSettingsSelector(card, card.parentNode);
        return true;
    }
    return false;
};
const findOfflineUserCard = (card, userOffline, usersCards) => {
    const userOnTheCard = card.querySelector("div.userName").innerHTML;
    if (userOnTheCard === userOffline) {
        card.remove();
        if (card.classList.value === "check") {
            Object.values(usersCards).some(findLocalUserCard);
        }
        return true;
    }
    return false;
};
const newOfflineUser = (userName) => {
    const usersCards = document.querySelectorAll("ul.users > li:not(:first-child)");
    Object.values(usersCards).some((card) => {
        findOfflineUserCard(card, userName, usersCards);
    });
};
const findUsersAlreadyRendered = (localListOfOnlineUsers, serverUsers) => {
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
    return { onlineUsers, offlineUsers };
};
const iterateThroughUsers = (users, renderFunction) => {
    users.forEach((user) => {
        if (user) {
            renderFunction(user.name);
        }
    });
};
const handleOnlineUsers = (serverPromise) => {
    const serverUsers = serverPromise.data;
    if (!localListOfOnlineUsers) {
        iterateThroughUsers(serverUsers, newOnlineUser);
    } else {
        const { onlineUsers, offlineUsers } = findUsersAlreadyRendered(
            localListOfOnlineUsers,
            serverUsers
        );
        iterateThroughUsers(onlineUsers, newOnlineUser);
        iterateThroughUsers(offlineUsers, newOfflineUser);
    }
    localListOfOnlineUsers = serverUsers;
};
const getOnlineUsers = () => {
    const promiseFromServer = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promiseFromServer.then(handleOnlineUsers);
    promiseFromServer.catch(connectionError);
};
const connectionError = (error) => {
    Object.values(ids).forEach((id) => {
        clearInterval(id);
    });
    localListOfOnlineUsers = false;
    lastRenderedMessages = false;
    loginPageLogic(error.config.url);
};
const keepConnection = () => {
    const connection = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", userMessage);
    connection.catch(connectionError);
};
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
const loginPageHideAndShow = () => {
    document.querySelector("#errorMessage").classList.toggle("hidden");
    document.querySelector("#loginButton").classList.toggle("hidden");
    document.querySelector("#userName").classList.toggle("hidden");
    document.querySelector(".loader").classList.toggle("hidden");
};
const loginError = () => {
    loginPageHideAndShow();
    document.querySelector(
        "#errorMessage"
    ).innerHTML = `Por favor, insira outro nome de usuário pois este já está em uso`;
};
const loginLogic = (clickedButton = "Enter") => {
    if (document.querySelector("#userName").value && clickedButton === "Enter") {
        loginPageHideAndShow();
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
        loginLogic();
    });
    document.querySelector("main.loginPage").addEventListener("keypress", (e) => {
        loginLogic(e.key);
    });
    window.addEventListener("resize", () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
};
const loginPageLogic = (errorConfigURL) => {
    document.querySelector("body").innerHTML = pagesData.loginPage;
    loginPageListeners();
    switch (errorConfigURL) {
        case "https://mock-api.driven.com.br/api/v6/uol/status": {
            document.querySelector("#errorMessage").innerHTML = "Conexão com o servidor perdida";
            break;
        }
        case "https://mock-api.driven.com.br/api/v6/uol/messages": {
            document.querySelector("#errorMessage").innerHTML =
                "Não foi possível carregar novas mensagens";
            break;
        }
        case "https://mock-api.driven.com.br/api/v6/uol/participants": {
            document.querySelector("#errorMessage").innerHTML =
                "Não foi possível carregar usuários online";
            break;
        }
    }
};
loginPageLogic();
