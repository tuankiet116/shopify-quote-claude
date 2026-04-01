export interface ButtonAppearance {
  button_text: string;
  bg_color: string;
  text_color: string;
  hover_bg_color: string;
  border_radius: number;
  border_width: number;
  border_color: string;
  size: 'small' | 'medium' | 'large';
}

export interface ButtonSettings {
  is_enabled: boolean;
  show_on_product: boolean;
  show_on_collection: boolean;
  show_on_search: boolean;
  show_on_home: boolean;
  appearance: ButtonAppearance;
}

export const DEFAULT_APPEARANCE: ButtonAppearance = {
  button_text: 'Request a Quote',
  bg_color: '#000000',
  text_color: '#FFFFFF',
  hover_bg_color: '#333333',
  border_radius: 4,
  border_width: 0,
  border_color: '#000000',
  size: 'medium',
};

export const DEFAULT_SETTINGS: ButtonSettings = {
  is_enabled: true,
  show_on_product: true,
  show_on_collection: true,
  show_on_search: true,
  show_on_home: true,
  appearance: DEFAULT_APPEARANCE,
};
