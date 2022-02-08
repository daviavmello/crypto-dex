Moralis.initialize("8mhQ8vxPNUaWL5v44ygPoWn0ovTJ1muKCGzL0XtB");
Moralis.serverURL = "https://vojnqi99exj1.usemoralis.com:2053/server";

let currentTrade = {};

async function init() {
  await Moralis.initPlugins();
  await Moralis.enableWeb3();
  await listAvailableTokens();
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth",
  });
  const tokens = result.tokens;
  let parent = document.getElementById("token-list");
  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement("div");
    div.setAttribute("data-address", "address");
    div.classList.add("token-row");
    let html = `
      <img class="token-list-img" src="${token.logoURI}">
      <span class="token-list-text>${token.symbol}</span>
    `;
    div.innerHTML = html;
    div.onclick = selectToken();
    parent.appendChild(div);
  }
}

async function selectToken() {
  closeModal();
  let address = event.target.getAttribute("data-address");
  console.log(address);
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.Web3.authenticate();
    }
  } catch (error) {
    console.log(error);
  }
}

const openModal = () => {
  document.getElementById("token-modal").style.display = "initial";
};

const closeModal = () => {
  document.getElementById("token-modal").style.display = "none";
};

init();

document.getElementById("from-token-select").onclick = openModal;
document.getElementById("modal-close").onclick = closeModal;

document.getElementById("login_button").onclick = login;
