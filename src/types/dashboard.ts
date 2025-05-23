export interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  rows: LayoutRow[];
}

export interface LayoutRow {
  id: string;
  columns: LayoutColumn[];
  height?: number;
}

export interface LayoutColumn {
  id: string;
  width: number; // 1-12 (Bootstrap-style grid)
  widgets: string[]; // Widget IDs
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: {
    row: number;
    column: number;
  };
}

export type WidgetType = 
  | 'category-links'
  | 'quick-links'
  | 'text-block'
  | 'weather'
  | 'clock'
  | 'stats'
  | 'calendar'
  | 'notes'
  | 'bookmarks'
  | 'rss-feed';

export interface WidgetConfig {
  // Category Links Widget
  categoryId?: string;
  showTitle?: boolean;
  
  // Quick Links Widget
  links?: QuickLink[];
  
  // Text Block Widget
  content?: string;
  
  // Weather Widget
  location?: string;
  
  // Stats Widget
  metric?: string;
  
  // Calendar Widget
  calendarId?: string;
  
  // Notes Widget
  note?: string;
  
  // RSS Feed Widget
  feedUrl?: string;
  maxItems?: number;
  
  // Common config
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
  customClass?: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
}

// Extended hub content to include dashboard layouts
export interface ExtendedHubContent {
  profile: {
    name: string;
    tagline: string;
    profileImage: string;
  };
  categories: Array<{
    id: string;
    title: string;
    emoji: string;
    color: string;
    links: Array<{
      id: string;
      title: string;
      url: string;
      emoji: string;
      color: string;
    }>;
  }>;
  dashboards: DashboardLayout[];
  currentDashboard?: string;
} 