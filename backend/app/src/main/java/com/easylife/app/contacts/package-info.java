@org.springframework.modulith.ApplicationModule(
        displayName = "Contacts",
        allowedDependencies = {
                "users::api",
                "categories::api",
                "shared"
        })
package com.easylife.app.contacts;