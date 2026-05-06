export interface User {
    _id: string;
    username: string;
    email: string;
    displayName : string;
    avaterUrl? : string;
    bio? : string;
    phone? : string;
    createdAt?: string;
    updatedAt?: string;
}