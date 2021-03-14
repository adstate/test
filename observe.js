class Observable {
    constructor(value, cloneValue) {
      // Maybe rename function defaultCloneValue. Can be mess with cloneValue. Look like it all data values.
      this._cloneValue = cloneValue || defaultCloneValue;
      this._curValue = this._cloneValue(value);
      this._listeners = [];
      
      // better to place function to class method
      // JSON.parse(JSON.stringify) lost methods and can change format of Date values
      function defaultCloneValue(v) {
        return JSON.parse(JSON.stringify(v));
      }
    }
  
    /**
     * Adds a listener that is notified of value changes (when `fireChanged()` is called).
     * A listener is a function that accepts the old value and the new value.
     * If the listener needs to unsubscribe, it can return `false`, all other values
     * will be ignored.
     * Parameters: listener function.
     */
    addListener(listenerFun) {
      // can use here addAsyncListener with delay: null to don't dublicate code
      this._listeners.push({f: listenerFun, delay: null});
    }
  
    /**
     * Adds an asynchronous listener that is notified of value changes (when `fireChanged()` is called)
     * not more frequently than once in `delay` ms.
     * A listener is a function that accepts the old value and the new value.
     * If the listener needs to unsubscribe, it can return `false`, all other values
     * will be ignored.
     * Parameters: listener function, delay in ms.
     */
    addAsyncListener(listenerFun, delay) {
      this._listeners.push({f: listenerFun, delay: delay});
    }
  
    // Wrong condition for filter. Need to change to listener.f !== listenerFun
    removeListener(listenerFun) {
      this._listeners = this._listeners.filter(listener => listener.f === listenerFun);
    }
    
    // Need to change all var to let/const to solve all problems with closure
    // At all this method look like logic overload, mess with spacing
    // Would be good to refactor and split it to small methods
    fireChanged(newValue) {
      var curValue = this._curValue;
      var listeners = this._listeners;
      for (var i = 0; i < listeners.length; ++i) { //change to i++
        var listener = listeners[i];
        var delay = listener.delay;
        // Func better move to class method and pass two arguments
        function callListener(oldValue) {
          // Need to change to strong equal. function can return Falsy value: 0, '', null ... for that we can't unsubscribe
          // I wiil be move result of func execution to variable for better reading
          if (listener.f(oldValue, newValue) == false) {
            //Better to use removeListener method. It remove specified listener and create new listeners array.
            // Don't need to decrease i
            listeners.splice(i--, 1);
          }
        }
        
        // If we want to use ability to run listener with 0 delay in tasks queue then condition with delay !== 0 can be stayed
        // If no it can be deleted
        if (!delay && delay !== 0) {
          callListener(curValue);
        } else {
          // this block also better move to class method  
          var job = listener.job;
          if (job) {
            // Don't need to clearTimeout here to save normal delay period
            clearTimeout(job);
          } else {
            listener.oldValue = curValue;
          }
          // need to start new job if there is no current job
          listener.job = setTimeout(function callListenerAsync() {
            listener.job = null;
            callListener(listener.oldValue);
          }, delay);
        }
      }
      this._curValue = this._cloneValue(newValue);
    }
  }
  
  export default Observable;
