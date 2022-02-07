Moralis.initialize("8mhQ8vxPNUaWL5v44ygPoWn0ovTJ1muKCGzL0XtB");
Moralis.serverURL = "https://vojnqi99exj1.usemoralis.com:2053/server";

async function init() {
  const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "bsc",
  });
  console.log(tokens);
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

document.getElementById("from-token-select").onclick = openModal;
document.getElementById("modal-close").onclick = closeModal;

document.getElementById("login_button").onclick = login;
