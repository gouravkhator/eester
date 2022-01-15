const getPageFromUri = (targetUri = '/') => {
    return {
        '/': 'index',
        '/auth/login': 'login/login',
        '/auth/register': 'login/register',
        '/user/dashboard': 'user/dashboard',
        '/user/edit': 'user/edit_user',
        '404': '404'
    }[targetUri];
}

module.exports = {
    getPageFromUri,
};
