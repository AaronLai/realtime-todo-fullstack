
export interface UserData {
  id: string | number;
  username: string;
  // Add any other fields that your user object contains, except password
}

export interface ValidatedUser {
  user: UserData;
  token: string;
}
