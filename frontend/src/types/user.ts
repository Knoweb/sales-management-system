export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    active: boolean;
    roles: Array<{ code: string; name: string }>;
}
