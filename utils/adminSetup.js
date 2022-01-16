const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');

const User = require('../models/User');

/**
 * Completes the initial setup of admin page. 
 */
function adminRouteInitialSetup() {
    AdminJS.registerAdapter(AdminJSMongoose);

    // ? NOT_CLEAR: I am unsure of how canModifyUsers should work, and why this below code is doing nothing.. 
    const canModifyUsers = ({ currentAdmin }) => {
        return currentAdmin && currentAdmin.role === 'admin';
    }

    const adminMain = new AdminJS({
        resources: [{
            resource: User, // resources should be set here, else the admin panel will not show those resources.
            options: {
                actions: {
                    edit: { isAccessible: canModifyUsers },
                    delete: { isAccessible: canModifyUsers },
                    new: { isAccessible: canModifyUsers },
                }
            }
        }],
        rootPath: '/admin', // the main path for the admin page
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
