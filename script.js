const CODE = `
function preparation(itemName, callback) {
    let preparationTime;
    switch (itemName) {
        case "Coffee":
            preparationTime = 4000;
            break;
        case "Chips":
            preparationTime = 10000;
            break;
        case "Burger":
            preparationTime = 10000;
            break;
        case "Juice":
            preparationTime = 500;
            break;
        default:
            console.log("We don't have that");
            return;
    }

    setTimeout(() => {
        console.log("Food prepped - " + itemName);
        callback(itemName);
    }, preparationTime);
}

function takeOrder(itemName) {
    console.log(itemName + ", is that correct?");
    submitOrder(itemName);
}

function submitOrder(itemName) {
    console.log("taking " + itemName + " to Kitchen");
    preparation(itemName, serveOrder);
}

function serveOrder(itemName) {
    console.log(itemName);
}

takeOrder("Coffee")
`

document.getElementById("code").innerHTML = CODE.trim().split("\n").reduce((str, line, index) => {
    str += `<span class="line${index + 1}"><span class="line-num">&nbsp&nbsp&nbsp${String(index + 1).padStart(2, " ")}&nbsp&nbsp&nbsp</span>` + line + "</span>\n"
    return str
}, "")

let currentHighlightedLine;
function removeHighlight() {
    if (currentHighlightedLine) {
        currentHighlightedLine.classList.remove("highlight")
        currentHighlightedLine = null
    }
}

function highlightLine(num) {
    removeHighlight()
    const line = document.getElementsByClassName(`line${num}`)[0]
    line.classList.add("highlight")
    currentHighlightedLine = line
}

const consoleEl = document.getElementById("console")
async function log(text) {
    await addToCallstack(`console.log(...)`)
    console.log(text);
    let node = document.createElement("div")
    node.classList.add("console-item")
    let codeElement = document.createElement("code")
    codeElement.append("> " + text)
    node.append(codeElement)
    consoleEl.appendChild(node)
    await popCallstack()
}

const callstack = document.getElementById("callstack")
async function addToCallstack(code) {
    let node = document.createElement("div")
    node.classList.add("callstack-item")
    let codeElement = document.createElement("code")
    let preElement = document.createElement("pre")
    preElement.classList.add("prettyprint")
    preElement.append(code)
    codeElement.append(preElement)
    node.append(codeElement)
    callstack.appendChild(node)
    PR.prettyPrint()
    await wait(2)
}

async function popCallstack() {
    callstack.removeChild(callstack.lastChild)
    await wait(1)
}

const eventQueue = document.getElementById("event-queue")
async function addToEventQueue(code) {
    let node = document.createElement("div")
    node.classList.add("event-queue-item")
    let codeElement = document.createElement("code")
    let preElement = document.createElement("pre")
    preElement.append(code)
    codeElement.append(preElement)
    node.append(codeElement)
    eventQueue.appendChild(node)
    PR.prettyPrint()
    await wait(0.5)
}

async function popEventQueue() {
    eventQueue.removeChild(eventQueue.firstChild)
    await wait(0.5)
}

async function wait(time) {
    await new Promise(resolve => setTimeout(resolve, time * 1000))
}

async function runCode() {
    async function preparation(itemName, callback) {
        let preparationTime;
        switch (itemName) {
            case "Coffee":
                preparationTime = 4000;
                break;
            case "Chips":
                preparationTime = 10000;
                break;
            case "Burger":
                preparationTime = 10000;
                break;
            case "Juice":
                preparationTime = 500;
                break;
            default:
                await log("We don't have that");
                return;
        }

        highlightLine(21)
        await addToCallstack(`setTimeout(...)`)
        setTimeout(async () => {
            await popEventQueue()
            highlightLine(22)
            await log("Food prepped - " + itemName);
            highlightLine(23)
            await addToCallstack(`callback(itemName)`)
            await callback(itemName);
            await popCallstack()
        }, preparationTime);
        await addToEventQueue(`${preparationTime}ms timeout`)
        removeHighlight()
        await popCallstack()
    }

    async function takeOrder(itemName) {
        highlightLine(28)
        await log(itemName + ", is that correct?");
        highlightLine(29)
        await addToCallstack(`submitOrder(itemName)`)
        await submitOrder(itemName);
        await popCallstack()
    }

    async function submitOrder(itemName) {
        highlightLine(33)
        await log("taking " + itemName + " to Kitchen");
        highlightLine(34)
        await addToCallstack(`preparation(itemName, serveOrder)`)
        await preparation(itemName, serveOrder);
        await popCallstack()
    }

    async function serveOrder(itemName) {
        highlightLine(38)
        await log(itemName);
        removeHighlight()
    }

    highlightLine(41)
    await addToCallstack(`takeOrder("Coffee")`)
    await takeOrder("Coffee")
    await popCallstack()
}

let debounce = false
document.getElementById("run").addEventListener("click", async () => {
    if (debounce) return;
    debounce = true
    await runCode()
    debounce = false
})