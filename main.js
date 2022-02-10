Moralis.initialize("8mhQ8vxPNUaWL5v44ygPoWn0ovTJ1muKCGzL0XtB");
Moralis.serverURL = "https://vojnqi99exj1.usemoralis.com:2053/server";

let currentTrade = {};
let currentSelectSide;
let tokens;

async function init() {
  await Moralis.initPlugins();
  await Moralis.enableWeb3();
  await listAvailableTokens();
  if (currentUser) {
    document.getElementById("swap-button").disabled = false;
  }
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth",
  });
  tokens = result.tokens;
  let parent = document.getElementById("token-list");
  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement("div");
    div.setAttribute("data-address", address);
    div.classList.add("token-row");
    let html = `
      <img class="token-list-img" src="${token.logoURI}" />
      <span class="token-list-text">${token.symbol}</span>
    `;
    div.innerHTML = html;
    div.onclick = () => selectToken(address);
    parent.appendChild(div);
  }
}

function selectToken(address) {
  closeModal();
  currentTrade[currentSelectSide] = tokens[address];
  renderInterface();
  getQuote();
}

function renderInterface() {
  if (currentTrade.from) {
    // From
    document.getElementById("from-token-img").src = currentTrade.from.logoURI;
    document.getElementById("from-token-text").innerHTML =
      currentTrade.from.symbol;
    // From styles
    document.getElementById("from-token-placeholder").style.display = "none";
    document.getElementById("from-token-container").style.display = "block";
    document.getElementById("from-token-container").style.paddingBottom =
      "0.5rem";
  }
  if (currentTrade.to) {
    // To
    document.getElementById("to-token-img").src = currentTrade.to.logoURI;
    document.getElementById("to-token-text").innerHTML = currentTrade.to.symbol;
    // To styles
    document.getElementById("to-token-placeholder").style.display = "none";
    document.getElementById("to-token-container").style.display = "block";
    document.getElementById("to-token-container").style.paddingBottom =
      "0.5rem";
  }
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.Web3.authenticate();
    }
    document.getElementById("swap-button").disabled = false;
  } catch (error) {
    console.log(error);
  }
}

const openModal = (side) => {
  currentSelectSide = side;
  document.getElementById("token-modal").style.display = "initial";
};

const closeModal = () => {
  document.getElementById("token-modal").style.display = "none";
};

async function getQuote() {
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !document.getElementById("from-amount").value
  ) {
    return;
  }

  const amount = Number(
    document.getElementById("from-amount").value *
      10 ** currentTrade.from.decimals
  );
  const quote = await Moralis.Plugins.oneInch.quote({
    chain: "eth",
    fromTokenAddress: currentTrade.from.address,
    toTokenAddress: currentTrade.to.address,
    amount: amount,
  });
  document.getElementById("to-amount").value =
    quote.toTokenAmount / 10 ** quote.toToken.decimals;
  if (quote.estimatedGas) {
    const estimatedGas = `<div id="gas-estimate-container">Estimated Gas: <span id="gas-estimate"></span></div>`;
    document
      .getElementById("swap-button")
      .insertAdjacentHTML("beforebegin", estimatedGas);
    document.getElementById("gas-estimate").innerHTML = quote.estimatedGas;
  }
}

async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  if (currentTrade.from.symbol !== "ETH") {
    const amount = Number(
      document.getElementById("from-amount").value *
        10 ** currentTrade.from.decimals
    );
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: "eth",
      fromTokenAddress: currentTrade.from.address,
      fromAddress: address,
      amount: amount,
    });
    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: "eth",
        tokenAddress: currentTrade.from.address,
        fromAddress: address,
      });
    }
  }
  const receipt = await doSwap(address, amount);
  alert(receipt);
}

async function swap(userAddress, amount) {
  return await Moralis.Plugins.oneInch.swap({
    chain: "eth",
    fromTokenAddress: currentTrade.from.address,
    toTokenAddress: currentTrade.to.address,
    amount: amount,
    fromAddress: userAddress,
    slippage: 1,
  });
}

init();

document.getElementById("from-token-select").onclick = () => openModal("from");
document.getElementById("to-token-select").onclick = () => openModal("to");
document.getElementById("modal-close").onclick = closeModal;
document.getElementById("login-button").onclick = login;
document.getElementById("from-amount").onblur = getQuote;
document.getElementById("swap-button").onclick = trySwap;
