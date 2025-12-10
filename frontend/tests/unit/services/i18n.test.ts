import { getLocale, default as i18n, setLocale } from '@/services/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('i18n Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default locale if no locale is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    const locale = await getLocale();
    
    expect(locale).toBe('en');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('user-locale');
  });

  it('should return stored locale if available', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('pt-BR');
    
    const locale = await getLocale();
    
    expect(locale).toBe('pt-BR');
  });

  it('should set new locale correctly', async () => {
    const newLocale = 'pt-BR';
    
    await setLocale(newLocale);
    
    expect(i18n.locale).toBe(newLocale);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user-locale', newLocale);
  });
});