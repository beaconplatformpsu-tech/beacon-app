import { uploadFileToFirebase } from '../storage';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

jest.mock('@/lib/firebase/config', () => ({
  storage: {}
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn()
}));

describe('uploadFileToFirebase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects if file size exceeds maximum', async () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    await expect(uploadFileToFirebase(file, 'path/test.png', { maxSizeMB: 2 }))
      .rejects.toThrow('File is too large. Maximum size is 2MB.');
  });

  it('rejects if file type is not allowed', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });

    await expect(uploadFileToFirebase(file, 'path/test.txt', { allowedTypes: ['image/png', 'image/jpeg'] }))
      .rejects.toThrow('Invalid file type. Allowed types: image/png, image/jpeg');
  });

  it('uploads file and returns download URL', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    
    const mockUploadTask = {
      on: jest.fn((event, onProgress, onError, onSuccess) => {
        // simulate success
        setTimeout(onSuccess, 0);
      }),
      snapshot: { ref: 'mock-ref' }
    };

    (uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask);
    (getDownloadURL as jest.Mock).mockResolvedValue('https://mock-url.com/test.png');

    const result = await uploadFileToFirebase(file, 'path/test.png');
    
    expect(uploadBytesResumable).toHaveBeenCalledWith(undefined, file);
    expect(getDownloadURL).toHaveBeenCalledWith('mock-ref');
    expect(result).toBe('https://mock-url.com/test.png');
  });

  it('calls onProgress callback', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    
    const mockUploadTask = {
      on: jest.fn((event, onProgress, onError, onSuccess) => {
        // simulate progress
        onProgress({ bytesTransferred: 50, totalBytes: 100 });
        setTimeout(onSuccess, 0);
      }),
      snapshot: { ref: 'mock-ref' }
    };

    (uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask);
    (getDownloadURL as jest.Mock).mockResolvedValue('https://mock-url.com');

    const onProgress = jest.fn();
    await uploadFileToFirebase(file, 'path/test.png', { onProgress });
    
    expect(onProgress).toHaveBeenCalledWith(50);
  });
});
