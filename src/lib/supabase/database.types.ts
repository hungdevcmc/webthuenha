/**
 * Kiểu dữ liệu của database Supabase (viết tay, khớp với supabase/migrations).
 * Nếu đổi schema, cập nhật file này tương ứng.
 */
export type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  address: string;
  district: string;
  city: string;
  price: number;
  deposit: number;
  electricity_price: number;
  electricity_unit: string;
  water_price: number;
  water_unit: string;
  service_fee: number;
  service_fee_included: boolean;
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  total_floors: number | null;
  amenities: string[];
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_zalo: string | null;
  is_available: boolean;
  is_published: boolean;
  /** Tin này có đang tìm bạn ở ghép không */
  roommate_open: boolean;
  /** Số bạn nam sẵn sàng ở ghép */
  roommate_male_count: number;
  /** Số bạn nữ sẵn sàng ở ghép */
  roommate_female_count: number;
  /** Ghi chú thêm về việc ở ghép */
  roommate_note: string;
  /** Giá một chỗ ở ghép mỗi tháng (VND); 0 nghĩa là chưa đặt */
  roommate_slot_price: number;
  /** Phòng dành cho: male = nam, female = nữ, any = nam hoặc nữ */
  roommate_gender: "male" | "female" | "any";
  /** Khoảng cách tới trường theo km, null nếu chưa đo */
  distance_to_school_km: number | null;
  created_at: string;
  updated_at: string;
};

export type PropertyInsert = Omit<PropertyRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PropertyUpdate = Partial<PropertyInsert>;

export type PropertyImageRow = {
  id: string;
  property_id: string;
  storage_path: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

export type PropertyImageInsert = Omit<PropertyImageRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type PropertyImageUpdate = Partial<PropertyImageInsert>;

export type TransferPostRow = {
  id: string;
  slug: string;
  title: string;
  address: string;
  district: string;
  city: string;
  price: number;
  deposit: number;
  /** Số tháng tiền cọc người nhận phải đóng: 1 hoặc 3 */
  deposit_months: number;
  /** Ngày hết hạn hợp đồng thuê hiện tại (YYYY-MM-DD) */
  contract_end_date: string;
  electricity_price: number;
  electricity_unit: string;
  water_price: number;
  water_unit: string;
  service_fee: number;
  service_fee_included: boolean;
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  total_floors: number | null;
  amenities: string[];
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_zalo: string | null;
  /** Khoảng cách tới trường theo km, null nếu chưa đo */
  distance_to_school_km: number | null;
  /** Đã pass được phòng cho người khác chưa */
  is_transferred: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type TransferPostInsert = Omit<TransferPostRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TransferPostUpdate = Partial<TransferPostInsert>;

export type TransferPostImageRow = {
  id: string;
  post_id: string;
  storage_path: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

export type TransferPostImageInsert = Omit<TransferPostImageRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type TransferPostImageUpdate = Partial<TransferPostImageInsert>;

export type AdminUserRow = {
  user_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
        Relationships: [];
      };
      property_images: {
        Row: PropertyImageRow;
        Insert: PropertyImageInsert;
        Update: PropertyImageUpdate;
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      transfer_posts: {
        Row: TransferPostRow;
        Insert: TransferPostInsert;
        Update: TransferPostUpdate;
        Relationships: [];
      };
      transfer_post_images: {
        Row: TransferPostImageRow;
        Insert: TransferPostImageInsert;
        Update: TransferPostImageUpdate;
        Relationships: [
          {
            foreignKeyName: "transfer_post_images_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "transfer_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
