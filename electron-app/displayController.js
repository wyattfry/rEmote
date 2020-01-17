const keysEnum = {
    'left': '37',
    'up': '38',
    'right': '39',
    'down': '40',
};
module.exports.moveElementWithArrowKeys = function (e, elementBeingEdited) {
    if (e.keyCode == keysEnum.up) {
        elementBeingEdited.style.top = elementBeingEdited.offsetTop - 1 + "px";
    }
    if (e.keyCode == keysEnum.down) {
        elementBeingEdited.style.top = elementBeingEdited.offsetTop + 1 + "px";
    }
    if (e.keyCode == keysEnum.left) {
        elementBeingEdited.style.left = elementBeingEdited.offsetLeft - 1 + "px";
    }
    if (e.keyCode == keysEnum.right) {
        elementBeingEdited.style.left = elementBeingEdited.offsetLeft + 1 + "px";
    }
};