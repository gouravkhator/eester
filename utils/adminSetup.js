const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');

const User = require('../models/user');

function adminRouteInitialSetup() {
    AdminJS.registerAdapter(AdminJSMongoose);

    const adminMain = new AdminJS({
        resources: [User],
        rootPath: '/admin',
    });

    const adminRouter = AdminJSExpress.buildRouter(adminMain); // admin router

    return {
        adminMain,
        adminRouter,
    }
}

module.exports = {
    adminRouteInitialSetup,
};
