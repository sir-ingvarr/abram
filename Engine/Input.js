class InputSystem {
    static Keys = new Set();
    static Events = {};
    static EventsOnce = {};


    static KeyPressed (key) {
        return this.Keys.has(key);
    }

    static SetPressedKey (key) {
        if(InputSystem.Keys.has(key)) return;
        this.Keys.add(key);
    }

    static HandleEvents (key) {
        const permanentListeners = InputSystem.Events[key] || [];
        const tempListeners = InputSystem.EventsOnce[key] || [];
        permanentListeners.forEach(handler => handler());
        tempListeners.forEach(handler => handler());
        delete InputSystem.EventsOnce[key];
    }

    static AddEventListener (key, handler, once) {
        const collection = once ? InputSystem.EventsOnce : InputSystem.Events;
        const handlersList = collection[key] || [];
        collection[key] = [].concat(handlersList, handler);
    }

    static RemovePressedKey (key) {
        this.Keys.delete(key);
    }

    static SetEventListeners () {
        document.addEventListener('keydown', e => {
            e.preventDefault();
            InputSystem.SetPressedKey(e.code);
        });
        document.addEventListener('keyup', e => {
            e.preventDefault();
            InputSystem.RemovePressedKey(e.code);
        });
    }
}