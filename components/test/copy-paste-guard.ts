interface CopyPasteEvent {
    type: 'copy' | 'paste' | 'cut';
    timestamp: number;
    selection?: string;
  }
  
  export class CopyPasteGuard {
    private events: CopyPasteEvent[] = [];
    private onViolation: (event: CopyPasteEvent) => void;
  
    constructor(onViolation: (event: CopyPasteEvent) => void) {
      this.onViolation = onViolation;
      this.initialize();
    }
  
    private initialize() {
      // Prevent default copy/paste/cut
      document.addEventListener('copy', this.handleCopy);
      document.addEventListener('paste', this.handlePaste);
      document.addEventListener('cut', this.handleCut);
  
      // Prevent keyboard shortcuts
      document.addEventListener('keydown', this.handleKeyboard);
  
      // Prevent context menu
      document.addEventListener('contextmenu', this.preventContextMenu);
  
      // Monitor selections
      document.addEventListener('selectstart', this.handleSelection);
    }
  
    private handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = window.getSelection()?.toString();
      const event: CopyPasteEvent = {
        type: 'copy',
        timestamp: Date.now(),
        selection
      };
      this.events.push(event);
      this.onViolation(event);
    };
  
    private handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const event: CopyPasteEvent = {
        type: 'paste',
        timestamp: Date.now()
      };
      this.events.push(event);
      this.onViolation(event);
    };
  
    private handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = window.getSelection()?.toString();
      const event: CopyPasteEvent = {
        type: 'cut',
        timestamp: Date.now(),
        selection
      };
      this.events.push(event);
      this.onViolation(event);
    };
  
    private handleKeyboard = (e: KeyboardEvent) => {
      // Prevent common copy/paste shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['c', 'v', 'x'].includes(key)) {
          e.preventDefault();
          const event: CopyPasteEvent = {
            type: key === 'c' ? 'copy' : key === 'v' ? 'paste' : 'cut',
            timestamp: Date.now()
          };
          this.events.push(event);
          this.onViolation(event);
        }
      }
    };
  
    private preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
  
    private handleSelection = (e: Event) => {
      // Monitor text selections
      setTimeout(() => {
        const selection = window.getSelection()?.toString();
        if (selection && selection.length > 50) { // Threshold for large selections
          const event: CopyPasteEvent = {
            type: 'copy',
            timestamp: Date.now(),
            selection
          };
          this.events.push(event);
          this.onViolation(event);
        }
      }, 100);
    };
  
    public cleanup() {
      document.removeEventListener('copy', this.handleCopy);
      document.removeEventListener('paste', this.handlePaste);
      document.removeEventListener('cut', this.handleCut);
      document.removeEventListener('keydown', this.handleKeyboard);
      document.removeEventListener('contextmenu', this.preventContextMenu);
      document.removeEventListener('selectstart', this.handleSelection);
    }
  
    public getViolations(): CopyPasteEvent[] {
      return [...this.events];
    }
  }