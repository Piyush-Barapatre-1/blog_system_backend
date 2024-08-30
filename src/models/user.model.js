module.exports = {
    User: {
        type: 'object',
        properties: {
            full_name: { type: 'string' },
            username: { type: 'string' },
            password: { type: 'string' },
            usertype: { type: 'string' },
        },
        required: ['full_name', 'username', 'password', 'usertype'],
    },
};
