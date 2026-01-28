export interface Wine {
  id: string;
  user_id: string;
  name: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  grape: string | null;
  appellation: string | null;
  vineyard: string | null;
  cru: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  image_url: string | null;
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
  name: string;
  producer?: string;
  vintage?: number;
  region?: string;
  grape?: string;
  appellation?: string;
  vineyard?: string;
  cru?: string;
  color?: string;
  size?: string;
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
}

// Friends Feature Types
export interface Profile {
  id: string;
  username: string | null;
  email: string;
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
