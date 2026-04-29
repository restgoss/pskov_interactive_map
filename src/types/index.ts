export type DistrictId =
  | 'gdovsky'
  | 'kuninsky'
  | 'ostrovsky'
  | 'pechorsky'
  | 'plussky'
  | 'porhovsky'
  | 'pskov'
  | 'pskovsky'
  | 'pushkinogorsky'
  | 'sebezhsky'
  | 'strugo_krasnensky'
  | 'velikoluksky'
  | 'bezhanitsky'
  | 'dedovichsky'
  | 'dnovsky'
  | 'krasnogorodsky'
  | 'loknyansky'
  | 'nevelsky'
  | 'novorzhevsky'
  | 'novosokolnichesky'
  | 'opochny'
  | 'palkinsky'
  | 'pustoshkinsky'
  | 'pytalovsky'
  | 'usvyatsky'
  | 'velikieluki';

export interface District {
  id: DistrictId;
  district: string;
  description: string | null;
  coat_url: string | null;
  is_disabled: boolean;
  sort_order: number;
}

export interface Attraction {
  id: string;
  district_id: DistrictId;
  title: string;
  description: string | null;
  image_url: string | null;
  lng: number | null;
  lat: number | null;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  attraction_id: string | null;
  district_id: string | null;
  author_name: string;
  user_email: string | null;
  rating: number;
  text: string;
  status_id: string;
  photo_urls: string[];
  created_at: string;
}

export interface NewReview {
  attraction_id: string;
  district_id: string;
  author_name: string;
  user_email: string;
  rating: number;
  text: string;
  status_id: string;
  photo_urls?: string[];
}
