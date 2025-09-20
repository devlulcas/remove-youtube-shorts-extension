const STATE = {
  HIDDEN: "ON",
  VISIBLE: "OFF",
};

const DEFAULT_STATE = STATE.HIDDEN;

const STATE_KEY = "state";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ [STATE_KEY]: DEFAULT_STATE });

  chrome.action.setBadgeText({
    text: DEFAULT_STATE,
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  await chrome.storage.sync.get(STATE_KEY, (result) => {
    if (result.state === STATE.HIDDEN) {
      toggleInjection(tabId, STATE.HIDDEN);
    } else {
      toggleInjection(tabId, STATE.VISIBLE);
    }
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });

  const nextState = prevState === STATE.HIDDEN ? STATE.VISIBLE : STATE.HIDDEN;

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  chrome.storage.sync.set({ [STATE_KEY]: nextState });

  toggleInjection(tab.id, nextState);
});

async function toggleInjection(tabId, state) {
  const css = "injectable.css";

  const cssData = {
    files: [css],
    target: { tabId },
  };

  if (state === STATE.HIDDEN) {
    await chrome.scripting.insertCSS(cssData);
  } else {
    await chrome.scripting.removeCSS(cssData);
  }
}
