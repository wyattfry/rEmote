const keyCodes = {
    'left': '37',
    'up': '38',
    'right': '39',
    'down': '40',
};

let resizeKeyPressed = false;

module.exports.resizeKeyDown = function() {
    resizeKeyPressed = true;
}

module.exports.resizeKeyUp = function() {
    resizeKeyPressed = false;
}

module.exports.getKeyboardTipMessage = function() {
    if (process.platform == 'darwin') {
        return "For fine adjustment, use arrow keys to move image, or command + up/down to resize";
    } else {
        return "For fine adjustment, use arrow keys to move image, or ctrl + up/down to resize";
    }
}

module.exports.moveElementWithArrowKeys = function (e, elementBeingEdited) {
    if (e.keyCode == keyCodes.up) {
        elementBeingEdited.style.top = elementBeingEdited.offsetTop - 1 + "px";
    }
    if (e.keyCode == keyCodes.down) {
        elementBeingEdited.style.top = elementBeingEdited.offsetTop + 1 + "px";
    }
    if (e.keyCode == keyCodes.left) {
        elementBeingEdited.style.left = elementBeingEdited.offsetLeft - 1 + "px";
    }
    if (e.keyCode == keyCodes.right) {
        elementBeingEdited.style.left = elementBeingEdited.offsetLeft + 1 + "px";
    }
};

module.exports.resizeElementWithArrowKeys = function (e, elementBeingEdited) {
    if (e.keyCode == keyCodes.up) {
        elementBeingEdited.style.height = elementBeingEdited.offsetHeight - 1 + "px";
    }
    if (e.keyCode == keyCodes.down) {
        elementBeingEdited.style.height = elementBeingEdited.offsetHeight + 1 + "px";
    }
};