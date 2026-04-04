let tempUserData: { [userId: string]: string } = {};

export function storeContextForUser(userId: string, context: string) {
    tempUserData[userId] = context;
}

export function getContextForUser(userId: string) {
    return tempUserData[userId] || null;
}