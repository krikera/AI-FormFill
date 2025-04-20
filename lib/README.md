# External Libraries

This directory contains libraries used by the AI FormFill extension.

## Libraries Included:

1. **Faker.js** (custom implementation): For generating realistic fake data.
   - Custom lightweight implementation based on @faker-js/faker API
   - Includes essential methods for form filling functionality
   - Source: Created locally to avoid CDN dependency issues

2. **CryptoJS** (v4.2.0): For data encryption and decryption.
   - Downloaded from: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js
   - Documentation: https://cryptojs.gitbook.io/docs/

## Implementation Notes

### Faker.js (Custom)
We've created a custom implementation of Faker.js with the following features:
- Compatible API with the original Faker.js library
- Supports all methods used in our extension
- Lightweight (only includes what we need)
- Works entirely offline without CDN dependencies

### CryptoJS
We're using the full library downloaded from the CDN to ensure all encryption capabilities are available.

## Benefits of Local Libraries

Using local libraries provides several advantages:
- Extension works entirely offline
- No Content Security Policy (CSP) issues
- Faster loading times
- Self-contained package with no external dependencies

## Testing

These libraries are primarily used in popup.js and content.js. If you encounter any issues, please check the browser console for error messages. 