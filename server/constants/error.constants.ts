class ErrorType {
    public static readonly LOGGED_IN_ON_OTHER_DEVICE: string = "LOGGED_IN_ON_OTHER_DEVICE";
    public static readonly INACTIVE_ACCOUNT: string = "INACTIVE_ACCOUNT";
    public static readonly INVALID_CREDENTIALS: string = "INVALID_CREDENTIALS";
    public static readonly NO_REFRESHTOKEN_PRESENT: string = "NO_REFRESHTOKEN_PRESENT";
    public static readonly REFRESHTOKEN_EXPIRED: string = "REFRESHTOKEN_EXPIRED";
    public static readonly SOCKETIO_TOKEN_EXPIRED: string = "SOKCKETIO_TOKEN_EXPIRED";
    public static readonly SOCKETIO_TOKEN_MISSING: string = "SOKCKETIO_TOKEN_MISSING";
    public static readonly TOKEN_EXPIRED: string = "TOKEN_EXPIRED";
    public static readonly TOKEN_MISSING: string = "TOKEN_MISSING";
}

export default ErrorType;
