export interface Wine {
  id: string;
  user_id: string;
  name: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  grape_variety: string | null;
  alcohol_percentage: number | null;
  bottle_size: string | null;
  appellation: string | null;
  importer: string | null;
  vineyard: string | null;
  winemaker_notes: string | null;
  image_url: string | null;
  stock: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tasting {
  id: string;
  wine_id: string;
  user_id: string;
  rating: number;
  notes: string | null;
  tasting_date: string;
  location: string | null;
  occasion: string | null;
  created_at: string;
}

export interface TastingWithWine extends Tasting {
  wine: Wine;
}

export interface WineFormData {
  name: string;
  producer?: string;
  vintage?: number;
  region?: string;
  grape_variety?: string;
  alcohol_percentage?: number;
  bottle_size?: string;
  appellation?: string;
  importer?: string;
  vineyard?: string;
  winemaker_notes?: string;
  stock?: number;
}

export interface TastingFormData {
  wine_id: string;
  rating: number;
  notes?: string;
  tasting_date: string;
  location?: string;
  occasion?: string;
}

export interface ExtractedWineData {
  name?: string;
  producer?: string;
  vintage?: number;
  region?: string;
  grape_variety?: string;
  alcohol_percentage?: number;
  bottle_size?: string;
  appellation?: string;
  importer?: string;
  vineyard?: string;
  winemaker_notes?: string;
}
