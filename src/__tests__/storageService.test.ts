import { storageService } from '../shared/services/storage/storageService';

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clear();
  });

  it('should store and retrieve string items', async () => {
    await storageService.setItem('test_key', 'hello_world');
    const value = await storageService.getItem<string>('test_key');
    expect(value).toBe('hello_world');
  });

  it('should store and retrieve complex object items', async () => {
    const user = { id: 123, name: 'Alice', active: true };
    await storageService.setItem('user_profile', user);
    const retrieved = await storageService.getItem<typeof user>('user_profile');
    expect(retrieved).toEqual(user);
  });

  it('should return null for non-existent keys', async () => {
    const value = await storageService.getItem('non_existent_key');
    expect(value).toBeNull();
  });

  it('should remove items correctly', async () => {
    await storageService.setItem('to_delete', 'value');
    await storageService.removeItem('to_delete');
    const value = await storageService.getItem('to_delete');
    expect(value).toBeNull();
  });

  it('should clear all items', async () => {
    await storageService.setItem('key1', 'val1');
    await storageService.setItem('key2', 'val2');
    await storageService.clear();
    expect(await storageService.getItem('key1')).toBeNull();
    expect(await storageService.getItem('key2')).toBeNull();
  });
});
