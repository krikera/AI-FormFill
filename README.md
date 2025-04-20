# AI FormFill Chrome Extension

A simple Chrome extension that helps users automatically fill forms with AI-powered field detection and smart data generation.

## Features

- 🔍 Smart form field detection
- 🤖 AI-powered field type recognition
- 📝 Auto-fill with realistic data
- 🔒 Secure data storage
- 🌙 Dark mode support
- 🔑 Password generator
- 📋 Multiple profiles support
- ⚡ Fast and lightweight

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of JavaScript, HTML, and CSS

### Project Structure

```
AIFormFill/
├── manifest.json
├── popup.html
├── options.html
├── css/
│   ├── popup.css
│   └── field-highlight.css
├── js/
│   ├── popup.js
│   ├── options.js
│   ├── content.js
│   └── background.js
└── lib/
    ├── faker.js
    └── crypto-js.min.js
```

### Building

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

### Testing

1. Run tests:
   ```bash
   npm test
   ```

2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Faker.js for fake data generation
- CryptoJS for encryption
- Chrome Extension APIs

## Support

For support, please open an issue in the GitHub repository. 
