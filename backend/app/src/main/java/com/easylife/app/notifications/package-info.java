@org.springframework.modulith.ApplicationModule(
        displayName = "Notifications",
        allowedDependencies = {
                "users::api",
                "todos",
                "goals",
                "calendar",
                "documents",
                "contacts",
                "journal",
                "weekplan",
                "shared"
        })
package com.easylife.app.notifications;