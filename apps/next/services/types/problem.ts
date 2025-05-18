export type Problem = {
    type: string;
    message: string;
    status: number;
    errors: Record<string, string>;
    reason: string;
}
