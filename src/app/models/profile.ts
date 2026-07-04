export const DEFAULT_AVATAR = "assets/img/avatar.jpg";

export interface UserProfile {
  userId: number,
  nickname: string,
  email: string,
  phoneNumber: string,
  avatar: string
}
