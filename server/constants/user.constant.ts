export interface UserReturnFields {
    [key: string]: number;
}

class UserConstants {
    public static readonly USER_RETURN_FIELDS: UserReturnFields = {
        username: 1,
        avatarstyle: 1,
        avatarseed: 1,
        email: 1,
        roles: 1,
        createdAt: 1,
        updatedAt: 1,
        active: 1,
    };

    public static readonly ONLINEUSER_RETURN_FIELDS: UserReturnFields = {
        username: 1,
        avatarstyle: 1,
        avatarseed: 1,
    };
}

export default UserConstants;
