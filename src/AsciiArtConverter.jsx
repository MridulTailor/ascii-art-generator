import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Settings,
  ImageIcon,
  Palette,
  Grid,
  Eye,
  GripVertical,
} from "lucide-react";

const AsciiArtConverter = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [settings, setSettings] = useState({
    width: 100,
    height: 50,
    fontSize: 6,
    brightness: 1,
    contrast: 1,
    inverted: false,
    grayscale: true,
    resolution: 1,
    characterSet: "standard",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(25);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const resizerRef = useRef(null);

  const CHARACTER_SETS = {
    standard: "@%#*+=-:. ",
    dense: "█▉▊▋▌▍▎▏ ",
    blocks: "██▓▒░  ",
    dots: "●◐◑◒◓◔◕○ ",
    numbers: "9876543210 ",
    letters: "MWNXK0Okxdolc:;,. ",
    simple: "█▓▒░ ",
    ascii:
      "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    minimal: "█░ ",
  };

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setPanelWidth(100);
      } else if (panelWidth === 100) {
        setPanelWidth(25);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [panelWidth]);

  const handleMouseDown = useCallback(
    (e) => {
      if (isMobile) return;
      setIsResizing(true);
      e.preventDefault();
    },
    [isMobile]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || isMobile) return;
      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      if (newWidth >= 20 && newWidth <= 50) {
        setPanelWidth(newWidth);
      }
    },
    [isResizing, isMobile]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const processImage = useCallback((img, config) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scaledWidth = Math.floor(config.width * config.resolution);
    const scaledHeight = Math.floor(config.height * config.resolution);

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    let filterString = `brightness(${config.brightness}) contrast(${config.contrast})`;
    if (config.grayscale) {
      filterString += " grayscale(100%)";
    }

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
    const pixels = imageData.data;
    const chars = CHARACTER_SETS[config.characterSet];
    let ascii = "";

    for (let i = 0; i < scaledHeight; i++) {
      for (let j = 0; j < scaledWidth; j++) {
        const pixelIndex = (i * scaledWidth + j) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const brightness = config.grayscale
          ? (r + g + b) / 3
          : 0.299 * r + 0.587 * g + 0.114 * b;
        const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
        const char = config.inverted
          ? chars[chars.length - 1 - charIndex]
          : chars[charIndex];
        ascii += char;
      }
      ascii += "\n";
    }

    return ascii;
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        const aspectRatio = img.height / img.width;
        const newHeight = Math.floor(settings.width * aspectRatio * 0.5);
        const newSettings = { ...settings, height: newHeight };
        setSettings(newSettings);
        const ascii = processImage(img, newSettings);
        setAsciiArt(ascii);
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    if (key === "width" && originalImage) {
      const aspectRatio = originalImage.height / originalImage.width;
      newSettings.height = Math.floor(value * aspectRatio * 0.5);
    }
    setSettings(newSettings);
    if (originalImage) {
      setIsProcessing(true);
      setTimeout(() => {
        const ascii = processImage(originalImage, newSettings);
        setAsciiArt(ascii);
        setIsProcessing(false);
      }, 100);
    }
  };

  const downloadAscii = () => {
    const element = document.createElement("a");
    const file = new Blob([asciiArt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ascii-art.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="relative z-10 w-full px-4 sm:px-6 py-4">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ASCII Art Generator
          </h1>
        </header>

        <div
          className={`w-full flex ${isMobile ? "flex-col" : "flex-row"} gap-6`}
          style={{ maxHeight: "100vh" }}
        >
          {/* Settings Panel */}
          <div
            className={`${
              isMobile ? "w-full" : ""
            } space-y-4 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl`}
            style={{
              width: isMobile ? "100%" : `${panelWidth}%`,
              maxHeight: isMobile ? "none" : "85vh",
            }}
          >
            <div className="p-6 space-y-6">
              {/* Upload Section */}
              <div className="border-b border-white/20 pb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-3 text-white">
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                  Upload Image
                </h2>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                  <p className="text-white mb-1">Click to upload</p>
                  <p className="text-sm text-gray-300">JPG, PNG, GIF</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {/* {originalImage && (
                  <div className="mt-4">
                    <img
                      src={originalImage.src}
                      alt="Original"
                      className="w-full rounded-xl border border-white/20 shadow-lg"
                    />
                  </div>
                )} */}
              </div>

              {/* Dimensions Section */}
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-white">
                  <Grid className="w-5 h-5 text-purple-400" />
                  Dimensions
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Width: {settings.width} chars
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={settings.width}
                      onChange={(e) =>
                        handleSettingsChange("width", parseInt(e.target.value))
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Height: {settings.height} chars
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={settings.height}
                      onChange={(e) =>
                        handleSettingsChange("height", parseInt(e.target.value))
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Resolution: {settings.resolution}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={settings.resolution}
                      onChange={(e) =>
                        handleSettingsChange(
                          "resolution",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="16"
                      value={settings.fontSize}
                      onChange={(e) =>
                        handleSettingsChange(
                          "fontSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Character Set Section */}
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-white">
                  <Palette className="w-5 h-5 text-pink-400" />
                  Character Set
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Style
                    </label>
                    <select
                      value={settings.characterSet}
                      onChange={(e) =>
                        handleSettingsChange("characterSet", e.target.value)
                      }
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    >
                      <option value="standard">Standard (@%#*+=-:.)</option>
                      <option value="dense">Dense (█▉▊▋▌▍▎▏)</option>
                      <option value="blocks">Blocks (██▓▒░)</option>
                      <option value="dots">Dots (●◐◑◒◓◔◕○)</option>
                      <option value="numbers">Numbers (9876543210)</option>
                      <option value="letters">Letters (MWNXK0Ok...)</option>
                      <option value="simple">Simple (█▓▒░)</option>
                      <option value="ascii">Full ASCII</option>
                      <option value="minimal">Minimal (█░)</option>
                    </select>
                  </div>
                  <div className="text-xs text-gray-300 font-mono bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                    Preview: {CHARACTER_SETS[settings.characterSet]}
                  </div>
                </div>
              </div>

              {/* Image Processing Section */}
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-white">
                  <Eye className="w-5 h-5 text-green-400" />
                  Image Processing
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Brightness: {settings.brightness}
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={settings.brightness}
                      onChange={(e) =>
                        handleSettingsChange(
                          "brightness",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">
                      Contrast: {settings.contrast}
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={settings.contrast}
                      onChange={(e) =>
                        handleSettingsChange(
                          "contrast",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="grayscale"
                        checked={settings.grayscale}
                        onChange={(e) =>
                          handleSettingsChange("grayscale", e.target.checked)
                        }
                        className="mr-3 w-5 h-5 text-blue-400 bg-white/10 border-white/20 rounded focus:ring-blue-400 focus:ring-2"
                      />
                      <label
                        htmlFor="grayscale"
                        className="text-sm font-medium text-gray-200"
                      >
                        Grayscale Mode
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inverted"
                        checked={settings.inverted}
                        onChange={(e) =>
                          handleSettingsChange("inverted", e.target.checked)
                        }
                        className="mr-3 w-5 h-5 text-blue-400 bg-white/10 border-white/20 rounded focus:ring-blue-400 focus:ring-2"
                      />
                      <label
                        htmlFor="inverted"
                        className="text-sm font-medium text-gray-200"
                      >
                        Invert Colors
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Section */}
              {asciiArt && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">
                    Export
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={downloadAscii}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      <Download className="w-5 h-5" />
                      Download TXT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resizer */}
          {!isMobile && (
            <div
              ref={resizerRef}
              onMouseDown={handleMouseDown}
              className="w-1 bg-white/20 hover:bg-white/40 cursor-col-resize flex items-center justify-center transition-colors backdrop-blur-sm rounded-full"
              style={{ minHeight: "85vh" }}
            >
              <GripVertical className="w-4 h-4 text-white/60" />
            </div>
          )}

          {/* Output Panel */}
          <div
            className={`${
              isMobile ? "w-full mt-4" : ""
            } rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl`}
            style={{
              width: isMobile ? "100%" : `${100 - panelWidth - 1}%`,
            }}
          >
            <div
              className="p-6 h-full"
              style={{ maxHeight: isMobile ? "none" : "85vh" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  ASCII Art Output
                </h2>
                {asciiArt && (
                  <div className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                    {settings.width}×{settings.height} @ {settings.fontSize}px
                  </div>
                )}
              </div>
              <div
                className="bg-black/40 backdrop-blur-sm rounded-xl p-6 h-full overflow-auto border border-white/10 shadow-inner"
                style={{ maxHeight: isMobile ? "60vh" : "calc(85vh - 120px)" }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400/30 border-t-blue-400"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-purple-400/20"></div>
                    </div>
                    <span className="ml-4 text-white font-medium">
                      Processing...
                    </span>
                  </div>
                ) : asciiArt ? (
                  <pre
                    className="text-green-300 font-mono leading-none whitespace-pre overflow-x-auto"
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: `${settings.fontSize * 1.1}px`,
                      textShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
                    }}
                  >
                    {asciiArt}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="w-20 h-20 mx-auto mb-6 opacity-50 text-blue-400" />
                      <p className="text-xl mb-2 text-white">
                        Upload an image to generate ASCII art
                      </p>
                      <p className="text-sm text-gray-300">
                        Supports JPG, PNG, and GIF formats
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 12px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }
        .slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 12px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }
        select option {
          background: rgba(30, 41, 59, 0.95);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default AsciiArtConverter;
