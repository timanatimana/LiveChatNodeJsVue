export class ErrorResponse extends Error {
    public statusCode: number;
    public type: string;

    constructor(message: any, statusCode: number, type?: string) {
        super(message);
        this.statusCode = statusCode;
        this.type = type ?? "";
    }
}
