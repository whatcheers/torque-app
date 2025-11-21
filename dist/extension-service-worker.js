const WINDOW_ID_KEY = 'torque-app-window-id'
const WINDOW_DIMENSIONS = { width: 640, height: 860 }

async function getStoredWindowId() {
  return new Promise((resolve) => {
    chrome.storage.session.get(WINDOW_ID_KEY, (result) => {
      resolve(result[WINDOW_ID_KEY] ?? null)
    })
  })
}

async function setStoredWindowId(id) {
  return new Promise((resolve) => {
    chrome.storage.session.set({ [WINDOW_ID_KEY]: id }, () => resolve())
  })
}

async function openOrFocusCalculator() {
  const existingId = await getStoredWindowId()

  if (existingId) {
    chrome.windows.get(existingId, (win) => {
      if (chrome.runtime.lastError || !win) {
        createWindow()
      } else {
        chrome.windows.update(existingId, { focused: true })
      }
    })
  } else {
    createWindow()
  }
}

function createWindow() {
  chrome.windows.create(
    {
      url: 'index.html',
      type: 'popup',
      focused: true,
      width: WINDOW_DIMENSIONS.width,
      height: WINDOW_DIMENSIONS.height,
    },
    (createdWindow) => {
      if (createdWindow?.id !== undefined) {
        setStoredWindowId(createdWindow.id)
      }
    }
  )
}

chrome.action.onClicked.addListener(() => {
  openOrFocusCalculator()
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '' })
})

chrome.windows.onRemoved.addListener((windowId) => {
  getStoredWindowId().then((storedId) => {
    if (storedId === windowId) {
      setStoredWindowId(null)
    }
  })
})

chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    openOrFocusCalculator()
  }
})
