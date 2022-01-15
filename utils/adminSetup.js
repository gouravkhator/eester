const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');

const User = require('../models/User');

function adminRouteInitialSetup() {
    AdminJS.registerAdapter(AdminJSMongoose);

    const canModifyUsers = ({ currentAdmin }) => {
        return currentAdmin && currentAdmin.role === 'admin';
    }

    const adminMain = new AdminJS({
        resources: [{
            resource: User,
            options: {
                actions: {
                    edit: { isAccessible: canModifyUsers },
                    delete: { isAccessible: canModifyUsers },
                    new: { isAccessible: canModifyUsers },
                }
            }
        }],
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
