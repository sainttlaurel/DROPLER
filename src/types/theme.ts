export interface StoreTheme {
  brandColor: string
  brandDark: string
  brandLight: string
  bgColor: string
  cardRadius: string
  fontHeading: string
  fontBody: string
  gridCols: 1 | 2 | 3 | 4
  heroStyle: 'centered' | 'left'
  heroTagline: string
  darkMode: boolean
}

export const DEFAULT_THEME: StoreTheme = {
  brandColor: '#7F77DD',
  brandDark: '#534AB7',
  brandLight: '#EEEDFE',
  bgColor: '#ffffff',
  cardRadius: '8px',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  gridCols: 4,
  heroStyle: 'centered',
  heroTagline: '',
  darkMode: false,
}

export const PRESET_COLORS = [
  { name: 'Purple', value: '#7F77DD', dark: '#534AB7', light: '#EEEDFE' },
  { name: 'Coral', value: '#FF6B6B', dark: '#CC5555', light: '#FFE5E5' },
  { name: 'Teal', value: '#20C997', dark: '#1AA179', light: '#D4F4EA' },
  { name: 'Blue', value: '#3B82F6', dark: '#2563EB', light: '#DBEAFE' },
  { name: 'Pink', value: '#EC4899', dark: '#DB2777', light: '#FCE7F3' },
  { name: 'Amber', value: '#F59E0B', dark: '#D97706', light: '#FEF3C7' },
  { name: 'Dark', value: '#1F2937', dark: '#111827', light: '#F3F4F6' },
]

export const BG_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Soft Purple', value: '#F5F3FF' },
  { name: 'Soft Green', value: '#F0FDF4' },
  { name: 'Warm', value: '#FFF7ED' },
  { name: 'Dark', value: '#1F2937' },
  { name: 'Darker', value: '#111827' },
]

export const FONT_OPTIONS = [
  'Inter',
  'Playfair Display',
  'Space Grotesk',
  'DM Sans',
  'Roboto Mono',
]

export const GOOGLE_FONTS = ['Playfair Display', 'Space Grotesk', 'DM Sans', 'Roboto Mono']
