export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
  errors?: string | string[];
}

export interface ApiMeta {
  feedMode?: string;
  pagination?: {
    currentPage: number;
    limit: number;
    total: number;
    numberOfPages: number;
    nextPage?: number;
  };
}

export interface AuthUser {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  photo?: string;
  cover?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  followers?: string[];
  following?: string[];
  bookmarks?: string[];
}

export interface AuthPayload {
  token: string;
  tokenType?: string;
  expiresIn?: string;
  user: AuthUser;
}

export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo?: string;
}

export interface PostItem {
  _id: string;
  id?: string;
  body?: string;
  image?: string;
  privacy?: 'public' | 'following' | 'private' | string;
  user: PostUser | string;
  sharedPost?: PostItem | null;
  likes?: string[];
  createdAt: string;
  commentsCount?: number;
  sharesCount?: number;
  likesCount?: number;
  isShare?: boolean;
  bookmarked?: boolean;
  liked?: boolean;
  topComment?: CommentItem | null;
}

export interface CommentItem {
  _id: string;
  content?: string;
  commentCreator?: PostUser;
  post?: string;
  parentComment?: string | null;
  likes?: string[];
  createdAt: string;
  repliesCount?: number;
  image?: string;
}

export interface SuggestionUser {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  followersCount?: number;
  mutualFollowersCount?: number;
}

export interface NotificationItem {
  _id: string;
  type?: string;
  isRead?: boolean;
  createdAt: string;
  actor?: PostUser;
  entity?: {
    body?: string;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
  };
}
