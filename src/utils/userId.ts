export function generateUserId(username: string) {
    return btoa(username).replace(/=/g, "");
}
