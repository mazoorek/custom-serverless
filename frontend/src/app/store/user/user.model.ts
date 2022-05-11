export interface User {
  id?: string;
  email?: string
}

export interface UserState {
  id?: string;
  email?: string
}

export const initialState: UserState = {
  id: undefined,
  email: undefined
}
