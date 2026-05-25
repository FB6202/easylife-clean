export type FollowStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface FollowResponse {
  id: number;
  followerId: number;
  followerUsername: string;
  followingId: number;
  followingUsername: string;
  status: FollowStatus;
  createdAt: string;
}

// Mapped display model
export interface FollowUser {
  followId: number;
  userId: number;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  status: FollowStatus;
}
