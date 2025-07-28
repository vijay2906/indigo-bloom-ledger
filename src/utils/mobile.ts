import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

// Check if running on mobile device
export const isMobile = () => Capacitor.isNativePlatform();

// Camera utilities for receipt capture
export const captureReceipt = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Select Photo Source',
      promptLabelPhoto: 'Photo Library',
      promptLabelPicture: 'Take Picture'
    });
    
    return image.dataUrl;
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
};

// Local storage utilities
export const saveToStorage = async (key: string, value: any) => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const getFromStorage = async (key: string) => {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting from storage:', error);
    return null;
  }
};

// Haptic feedback
export const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!isMobile()) return;
  
  try {
    const impactStyle = style === 'light' ? ImpactStyle.Light : 
                       style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Error with haptic feedback:', error);
  }
};

// Notification utilities
export const schedulePaymentReminder = async (title: string, body: string, date: Date) => {
  if (!isMobile()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: date },
          sound: 'default',
          actionTypeId: '',
          extra: null
        }
      ]
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Status bar styling
export const setupStatusBar = async () => {
  if (!isMobile()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#6366f1' }); // Indigo-500
  } catch (error) {
    console.error('Error setting up status bar:', error);
  }
};

// Export financial data
export const exportFinancialData = async (data: any) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  // For mobile, this will trigger the share dialog
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'MyFinancials Export',
        text: 'Financial data export',
        url: url
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback for non-mobile or unsupported browsers
    const link = document.createElement('a');
    link.href = url;
    link.download = `myfinancials-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};