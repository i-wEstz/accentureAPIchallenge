export const getUserList = () => {
    return [{
            id: 1,
            name: "KC",
            age: 30,
            id_card: "e2smd31345",
            risk_level: "LOW"
        },
        {
            id: 2,
            name: "KB",
            age: 22,
            id_card: "1254444sds",
            risk_level: "HIGH"
        }
    ]
}


export const findUserById = (id) => {
    const users = getUserList()
    const userFound = users.filter((user) => {
        if (user.id === id) {
            return user
        }
    });
    if (userFound.length > 0) {
        return userFound
    }
    return false

}