interface DevToolsStatus {
    isOpen: boolean;
    orientation?: 'vertical' | 'horizontal';
  }
  
  export function detectBrowserDevTools(): boolean {
    const threshold = 160;
    let devtoolsStatus: DevToolsStatus = { isOpen: false };
  
    // Console logging detection
    const consoleCheck = () => {
      const startTime = performance.now();
      console.log('DevTools Detection');
      console.clear();
      const endTime = performance.now();
      return endTime - startTime > 100;
    };
  
    // Size differential detection
    const sizeCheck = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        devtoolsStatus = {
          isOpen: true,
          orientation: widthThreshold ? 'vertical' : 'horizontal'
        };
        return true;
      }
      return false;
    };
  
    // Debugger detection
    const debuggerCheck = () => {
      let isDebuggerAttached = false;
      const handler = {
        get: () => {
          isDebuggerAttached = true;
          return false;
        }
      };
      const proxy = new Proxy({}, handler);
      devtoolsStatus.isOpen = proxy.isDebuggerAttached || isDebuggerAttached;
      return devtoolsStatus.isOpen;
    };
  
    return consoleCheck() || sizeCheck() || debuggerCheck();
  }