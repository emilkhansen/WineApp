// Reference Data Types
export interface Color {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface GrapeVarietyRef {
  id: string;
  name: string;
  color: string | null;
  created_at?: string;
}

export interface Region {
  id: string;
  name: string;
  country: string | null;
  created_at?: string;
}

export interface Subregion {
  id: string;
  name: string;
  region_id: string;
  region?: Region;
  created_at?: string;
}

export interface Commune {
  id: string;
  name: string;
  subregion_id: string;
  subregion?: Subregion;
  created_at?: string;
}

export interface CruClassification {
  id: string;
  name: string;
  region_id: string | null;
  region?: Region;
  created_at?: string;
}

export interface AppellationRef {
  id: string;
  name: string;
  region_id: string | null;
  subregion_id: string | null;
  region?: Region;
  subregion?: Subregion;
  created_at?: string;
}

export interface Producer {
  id: string;
  name: string;
  region_id: string | null;
  region?: Region;
  created_at?: string;
}

export interface Vineyard {
  id: string;
  name: string;
  region_id: string | null;
  appellation_id: string | null;
  region?: Region;
  appellation?: AppellationRef;
  created_at?: string;
}

// Wine Types
export interface Wine {
  id: string;
  user_id: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  subregion: string | null;
  commune: string | null;
  grape: string | null;
  appellation: string | null;
  vineyard: string | null;
  cru: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  image_url: string | null;
  is_public: boolean;
  is_mine: boolean;
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

export interface TastingWithWineAndAuthor extends TastingWithWine {
  author: {
    id: string;
    username: string | null;
    isMe: boolean;
  };
}

export interface WineFormData {
  producer?: string;
  vintage?: number;
  region?: string;
  subregion?: string;
  commune?: string;
  grape?: string;
  appellation?: string;
  vineyard?: string;
  cru?: string;
  color?: string;
  size?: string;
  stock?: number;
  is_mine?: boolean;
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
  producer?: string;
  vintage?: number;
  region?: string;
  subregion?: string;
  commune?: string;
  grape?: string;
  appellation?: string;
  vineyard?: string;
  cru?: string;
  color?: string;
  size?: string;
}

export interface ExtractedWineWithId extends ExtractedWineData {
  tempId: string;
  position?: string;
  originalValues?: Partial<ExtractedWineData>;  // Stores original AI-extracted values before matching
}

// Friends Feature Types
export interface Profile {
  id: string;
  username: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface FriendWithProfile extends Friendship {
  profile: Profile;
}

export interface PendingRequest extends Friendship {
  sender: Profile;
}

// Tasting Scan Feature Types
export interface ScannedWineForTasting {
  tempId: string;
  extracted: ExtractedWineData;
  match: {
    wine: Wine;
    confidence: "high" | "medium";
  } | null;
  selectedWineId: string | "new" | "not_mine";  // tracks user selection: wine ID, "new" for creating, or "not_mine" for wines user doesn't own
  rating: number;
  notes: string;
}

export interface TastingScanSharedData {
  tasting_date: string;
  location?: string;
  occasion?: string;
}

export interface CreateTastingFromScanInput {
  wine_id?: string;
  newWine?: WineFormData;
  rating: number;
  notes?: string;
}

// Dashboard Chart Types
export interface EnhancedStats {
  cellarSize: number;
  totalWines: number;
  averageRating: number | null;
  tastingsThisMonth: number;
  tastingsTrend: number;
}

export interface DistributionData {
  byColor: { name: string; count: number; fill: string }[];
  byRegion: { name: string; count: number }[];
}

export interface TrendData {
  month: string;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface TopListsData {
  regions: { name: string; count: number }[];
  producers: { name: string; count: number }[];
}
