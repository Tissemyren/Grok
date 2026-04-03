let tempUserData: { [userId: string]: string } = {};

function storeContextForUser(userId: string, context: string) {
    tempUserData[userId] = context;
}

function getContextForUser(userId: string) {
    return tempUserData[userId] || null;
}

export default {
    storeContextForUser,
    getContextForUser
}