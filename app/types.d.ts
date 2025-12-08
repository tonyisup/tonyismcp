
export { };

declare global {
  interface WebGazerData {
    x: number;
    y: number;
  }

  interface WebGazer {
    setGazeListener: (listener: (data: WebGazerData | null, elapsedTime: number) => void) => WebGazer;
    begin: () => void;
    end: () => void;
    showVideoPreview: (show: boolean) => WebGazer;
    showPredictionPoints: (show: boolean) => WebGazer;
    pause: () => void;
    resume: () => void;
    setRegression: (modelName: string) => WebGazer;
    clearData: () => Promise<void> | void;
  }

  interface Window {
    webgazer: WebGazer;
  }
}
