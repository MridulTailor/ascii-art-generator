# ASCII Art Generator

Transform your images into captivating ASCII art with this powerful and user-friendly web application. Built with React, this tool offers real-time conversion, extensive customization options, and seamless export capabilities.

## ✨ Features

- **Image Upload**: Easily upload images via drag-and-drop or click-to-upload (JPG, PNG, GIF formats supported).
- **Real-time ASCII Conversion**: Watch your images instantly transform into ASCII art using advanced brightness mapping algorithms.
- **Customizable Settings**: Fine-tune your ASCII art with a range of controls:
  - **Width Control**: Adjust the output width from 20 to 150 characters.
  - **Font Size Adjustment**: Set the font size from 4px to 16px for varied detail.
  - **Brightness & Contrast**: Modify image brightness and contrast for optimal results.
  - **Color Inversion**: Invert the ASCII characters to create unique visual effects.
  - **Character Set Selection**: Choose from various character sets (e.g., standard, dense, blocks, dots, numbers, full ASCII) to achieve different artistic styles.
- **Export Options**:
  - **Copy to Clipboard**: Quickly copy the generated ASCII art to your clipboard.
  - **Download as .TXT**: Save your ASCII masterpiece as a `.txt` file for offline use.
- **Responsive Design**: Enjoy a consistent and intuitive experience across all devices, from desktop to mobile.

## 🚀 How It Works

1.  **Image Processing**: When you upload an image, the application uses the HTML5 Canvas API to efficiently resize and analyze its pixel data.
2.  **Brightness Mapping**: Each pixel's brightness is meticulously mapped to a corresponding ASCII character from a predefined set (e.g., `@%#*+=-:. `), creating a visual representation of the image using text characters.
3.  **Real-time Updates**: Any adjustments you make to the settings — like width, font size, brightness, or character set — instantly regenerate the ASCII art, allowing for immediate visual feedback.
4.  **Aspect Ratio Preservation**: The converter intelligently maintains the original image's aspect ratio, ensuring that your ASCII art maintains proper proportions, aided by character height/width compensation.

## 🛠️ Tech Stack

- **React**:
  - **React Hooks**: `useState`, `useRef`, and `useCallback` are utilized.
- **Canvas API**: Powers the core image processing and pixel manipulation functionalities.
- **FileReader API**: Handles secure and efficient image file uploads from the user's device.
- **Clipboard API**: Enables copying of the generated ASCII art to the clipboard.
- **Blob API**: Facilitates the creation and downloading of `.txt` files containing the ASCII art.
- **Tailwind CSS**: For rapid and responsive styling.
- **Lucide React**: For SVG icons.
