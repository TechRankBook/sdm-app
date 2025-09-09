import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    React.createElement(BaseToast, {
      ...props,
      style: {
        borderLeftColor: 'hsl(120, 35%, 35%)', // Traditional forest green
        backgroundColor: 'hsl(var(--card))',
        borderLeftWidth: 5,
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      contentContainerStyle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      text1Style: {
        fontSize: 16,
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      },
      text2Style: {
        fontSize: 14,
        color: 'hsl(var(--muted-foreground))',
        lineHeight: 20,
      },
    })
  ),

  error: (props: any) => (
    React.createElement(ErrorToast, {
      ...props,
      style: {
        borderLeftColor: 'hsl(var(--destructive))',
        backgroundColor: 'hsl(var(--card))',
        borderLeftWidth: 5,
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      contentContainerStyle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      text1Style: {
        fontSize: 16,
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      },
      text2Style: {
        fontSize: 14,
        color: 'hsl(var(--muted-foreground))',
        lineHeight: 20,
      },
    })
  ),

  info: (props: any) => (
    React.createElement(BaseToast, {
      ...props,
      style: {
        borderLeftColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--card))',
        borderLeftWidth: 5,
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      contentContainerStyle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      text1Style: {
        fontSize: 16,
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      },
      text2Style: {
        fontSize: 14,
        color: 'hsl(var(--muted-foreground))',
        lineHeight: 20,
      },
    })
  ),

  warning: (props: any) => (
    React.createElement(BaseToast, {
      ...props,
      style: {
        borderLeftColor: '#f59e0b',
        backgroundColor: 'hsl(var(--card))',
        borderLeftWidth: 5,
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      contentContainerStyle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      text1Style: {
        fontSize: 16,
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      },
      text2Style: {
        fontSize: 14,
        color: 'hsl(var(--muted-foreground))',
        lineHeight: 20,
      },
    })
  ),
};