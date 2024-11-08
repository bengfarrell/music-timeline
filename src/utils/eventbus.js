export class EventBus {
    /**
     * Add event listener.
     */
    static addEventListener(type, callback) {
        const listener = { type, callback };
        EventBus.listeners.push(listener);
        return listener;
    }
    /**
     * Remove event listener.
     * @param listener - Event listener to remove.
     */
    static removeEventListener(listener) {
        for (let c = 0; c < EventBus.listeners.length; c++) {
            if (listener === EventBus.listeners[c]) {
                EventBus.listeners.splice(c, 1);
                return;
            }
        }
    }
    /**
     * Remove event listeners.
     * @param listeners - List of event listeners to remove.
     */
    static removeEventListeners(listeners) {
        listeners.forEach((listener) => {
            EventBus.removeEventListener(listener);
        });
    }
    /**
     * Trigger event.
     * @param ce - Custom event to dispatch.
     */
    static dispatchEvent(ce) {
        const listeners = this.listeners.slice();
        listeners.forEach(function (l) {
            if (ce.type === l.type) {
                //@ts-ignore
                l.callback.apply(this, [ce]);
            }
        });
    }
}
EventBus.listeners = [];
//# sourceMappingURL=eventbus.js.map