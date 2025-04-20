import { detectFormFields, addFieldHighlighting, removeFieldHighlighting } from '../../js/content';
import { Accessibility } from '../../js/utils/accessibility';
import { Performance } from '../../js/utils/performance';
import { ErrorHandler } from '../../js/utils/error-handler';

// Mock dependencies
jest.mock('../../js/utils/accessibility');
jest.mock('../../js/utils/performance');
jest.mock('../../js/utils/error-handler');

describe('Content Script', () => {
  let mockDocument;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock document
    mockDocument = {
      querySelectorAll: jest.fn(),
      createElement: jest.fn(),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    };

    global.document = mockDocument;
  });

  describe('detectFormFields', () => {
    it('should detect input fields', () => {
      const mockInput = {
        type: 'text',
        name: 'username',
        id: 'username',
        placeholder: 'Enter username'
      };

      mockDocument.querySelectorAll.mockReturnValue([mockInput]);

      const fields = detectFormFields();

      expect(fields).toHaveLength(1);
      expect(fields[0]).toMatchObject({
        type: 'text',
        name: 'username',
        id: 'username',
        placeholder: 'Enter username'
      });
    });

    it('should handle errors gracefully', () => {
      mockDocument.querySelectorAll.mockImplementation(() => {
        throw new Error('DOM error');
      });

      const fields = detectFormFields();

      expect(fields).toHaveLength(0);
      expect(ErrorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('addFieldHighlighting', () => {
    it('should add highlighting to fields', () => {
      const mockField = {
        classList: {
          add: jest.fn()
        },
        setAttribute: jest.fn()
      };

      mockDocument.querySelectorAll.mockReturnValue([mockField]);

      addFieldHighlighting();

      expect(mockField.classList.add).toHaveBeenCalledWith('ai-formfill-highlight');
      expect(mockField.setAttribute).toHaveBeenCalled();
      expect(Accessibility.addAriaAttributes).toHaveBeenCalled();
    });
  });

  describe('removeFieldHighlighting', () => {
    it('should remove highlighting from fields', () => {
      const mockField = {
        classList: {
          remove: jest.fn()
        },
        removeAttribute: jest.fn()
      };

      mockDocument.querySelectorAll.mockReturnValue([mockField]);

      removeFieldHighlighting();

      expect(mockField.classList.remove).toHaveBeenCalledWith('ai-formfill-highlight');
      expect(mockField.removeAttribute).toHaveBeenCalled();
    });
  });
}); 